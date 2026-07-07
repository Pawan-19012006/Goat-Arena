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
  async retrieve(query: string, limit = 1): Promise<string> {
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

          if (score > 0) {
            rankedBlocks.push({
              text: block.length > 350 ? block.slice(0, 350) + "..." : block,
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
        return "";
      }

      return selected
        .map(b => `[Source: ${b.source}]\n${b.text}`)
        .join("\n\n---\n\n");

    } catch (error) {
      console.error("Retrieval error:", error);
      return "";
    }
  }
}

// Global default provider
export const defaultRetrieval = new MarkdownKeywordRetrieval();
export async function getRetrievalContext(query: string, limit = 1): Promise<string> {
  return defaultRetrieval.retrieve(query, limit);
}
