import fs from "fs";
import path from "path";

/**
 * Abstraction for the Retrieval Layer, allowing easy future upgrades (e.g. to vector search/embeddings)
 */
export interface RetrievalProvider {
  /**
   * Retrieves relevant context strings based on a textual query.
   */
  retrieve(query: string, limit?: number): Promise<string>;
}

/**
 * Local file-based keyword matching retrieval provider.
 * Reads Markdown files, breaks them into paragraph blocks, and ranks them by query keyword matches.
 */
export class MarkdownKeywordRetrieval implements RetrievalProvider {
  private knowledgeDir: string;
  private stopwords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", 
    "for", "of", "to", "with", "by", "that", "this", "these", "those", 
    "are", "was", "were", "been", "has", "have", "had", "do", "does", "did",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"
  ]);

  constructor(knowledgeDir?: string) {
    // Default to a folder called "knowledge" in the project root
    this.knowledgeDir = knowledgeDir || path.join(process.cwd(), "knowledge");
  }

  /**
   * Scans knowledge base files, scores paragraph blocks, and returns matching context.
   */
  async retrieve(query: string, limit = 3): Promise<string> {
    try {
      if (!fs.existsSync(this.knowledgeDir)) {
        console.warn(`Knowledge directory not found at: ${this.knowledgeDir}`);
        return "";
      }

      // 1. Extract keywords from query
      const words = query
        .toLowerCase()
        .replace(/[^\w\s']/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 1 && !this.stopwords.has(w));

      if (words.length === 0) {
        // Fallback: search for exact matches or use whole word search if no keywords remain
        words.push(...query.toLowerCase().split(/\s+/).filter(w => w.length > 0));
      }

      // 2. Read all files in directory
      const files = fs.readdirSync(this.knowledgeDir).filter(f => f.endsWith(".md"));
      const rankedBlocks: { text: string; score: number; source: string }[] = [];

      // Detect prioritized player file from query
      let prioritizedFile = "";
      const normalizedQuery = query.toLowerCase();
      for (const file of files) {
        const nameWithoutExt = file.replace(".md", "").toLowerCase();
        if (normalizedQuery.includes(nameWithoutExt)) {
          prioritizedFile = file;
          break;
        }
      }

      for (const file of files) {
        const filePath = path.join(this.knowledgeDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        
        // Split content by double newlines into blocks (paragraphs or list sections)
        const blocks = content.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0);

        for (const block of blocks) {
          let score = 0;
          const blockLower = block.toLowerCase();

          // Award score based on keyword frequency in this block
          for (const word of words) {
            const regex = new RegExp(`\\b${word}\\b`, "g");
            const matches = blockLower.match(regex);
            if (matches) {
              score += matches.length;
            } else if (blockLower.includes(word)) {
              // Partial match fallback (e.g. substrings)
              score += 0.5;
            }
          }

          // If block is from the player file matching the query, boost score to ensure relevance
          if (score > 0 && file === prioritizedFile) {
            score += 10;
          }

          if (score > 0) {
            // Truncate individual blocks to 450 characters to save context space
            const truncatedText = block.length > 450 ? block.slice(0, 450) + "..." : block;
            rankedBlocks.push({
              text: truncatedText,
              score: score,
              source: file
            });
          }
        }
      }

      // 3. Sort blocks by score descending
      rankedBlocks.sort((a, b) => b.score - a.score);

      // 4. Return top blocks formatted with source info
      const selected = rankedBlocks.slice(0, limit);
      
      if (selected.length === 0) {
        // Fallback: if no keyword scored any points, but we prioritized a file, return its first block
        if (prioritizedFile) {
          const filePath = path.join(this.knowledgeDir, prioritizedFile);
          const content = fs.readFileSync(filePath, "utf-8");
          const firstBlock = content.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0)[0];
          if (firstBlock) {
            return `[Source: ${prioritizedFile} (Profile Overview)]\n${firstBlock.slice(0, 450)}`;
          }
        }
        return "";
      }

      // Join blocks and cap total size to 1300 characters to fit context windows
      let joinedContext = selected.map(b => `[Source: ${b.source}]\n${b.text}`).join("\n\n---\n\n");
      if (joinedContext.length > 1300) {
        joinedContext = joinedContext.slice(0, 1300) + "\n...[Context Truncated]";
      }

      return joinedContext;

    } catch (error) {
      console.error("Retrieval error:", error);
      return "";
    }
  }
}

// Global default provider
export const defaultRetrieval = new MarkdownKeywordRetrieval();
export async function getRetrievalContext(query: string, limit = 3): Promise<string> {
  return defaultRetrieval.retrieve(query, limit);
}
