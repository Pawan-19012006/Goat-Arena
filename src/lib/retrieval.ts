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

export async function getEntityContext(entityName: string): Promise<string> {
  try {
    const normalized = entityName.toLowerCase().trim();
    let fileName = "";
    if (normalized.includes("messi")) fileName = "messi.md";
    else if (normalized.includes("ronaldo")) fileName = "ronaldo.md";
    else if (normalized.includes("mbappe") || normalized.includes("mbappé")) fileName = "mbappe.md";
    else if (normalized.includes("haaland")) fileName = "haaland.md";
    else if (normalized.includes("argentina")) fileName = "argentina.md";
    else if (normalized.includes("brazil")) fileName = "brazil.md";

    if (!fileName) {
      console.warn(`No explicit entity mapping found for: ${entityName}`);
      return "";
    }

    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const filePath = path.join(knowledgeDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`Entity knowledge file not found at: ${filePath}`);
      return "";
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return content.length > 1300 ? content.slice(0, 1300) : content;
  } catch (error) {
    console.error("getEntityContext error:", error);
    return "";
  }
}

export async function getEntitySectionContext(entityName: string, query: string): Promise<{ section: string; content: string }> {
  try {
    const normalized = entityName.toLowerCase().trim();
    let fileName = "";
    if (normalized.includes("messi")) fileName = "messi.md";
    else if (normalized.includes("ronaldo")) fileName = "ronaldo.md";
    else if (normalized.includes("mbappe") || normalized.includes("mbappé")) fileName = "mbappe.md";
    else if (normalized.includes("haaland")) fileName = "haaland.md";
    else if (normalized.includes("argentina")) fileName = "argentina.md";
    else if (normalized.includes("brazil")) fileName = "brazil.md";

    if (!fileName) {
      return { section: "DEFAULT", content: "" };
    }

    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const filePath = path.join(knowledgeDir, fileName);
    if (!fs.existsSync(filePath)) {
      return { section: "DEFAULT", content: "" };
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Detect section based on query keywords
    const q = query.toLowerCase();
    let section = "TACTICS";
    if (q.includes("history") || q.includes("origin") || q.includes("timeline") || q.includes("old") || q.includes("young") || q.includes("first") || q.includes("when") || q.includes("born") || q.includes("who") || q.includes("founder") || q.includes("began") || q.includes("start")) {
      section = "HISTORY";
    } else if (q.includes("record") || q.includes("stat") || q.includes("goal") || q.includes("assist") || q.includes("most") || q.includes("number")) {
      section = "RECORDS";
    } else if (q.includes("trophy") || q.includes("won") || q.includes("achieve") || q.includes("award") || q.includes("ballon") || q.includes("cup") || q.includes("copa") || q.includes("title")) {
      section = "ACHIEVEMENTS";
    } else if (q.includes("weak") || q.includes("loophole") || q.includes("fail") || q.includes("defeat") || q.includes("beat") || q.includes("lose") || q.includes("poor")) {
      section = "WEAKNESSES";
    }

    // Extract section from segmented markdown file
    const lines = fileContent.split("\n");
    let insideSection = false;
    const sectionLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("## ")) {
        const header = line.replace("## ", "").toUpperCase().trim();
        if (header.includes(section)) {
          insideSection = true;
        } else {
          insideSection = false;
        }
      } else if (insideSection) {
        sectionLines.push(line);
      }
    }

    const content = sectionLines.join("\n").trim();
    return { section, content: content || fileContent.slice(0, 800) };
  } catch (error) {
    console.error("getEntitySectionContext error:", error);
    return { section: "DEFAULT", content: "" };
  }
}

export async function getEntityMultiSectionContext(entityName: string, sections: string[]): Promise<string> {
  try {
    const normalized = entityName.toLowerCase().trim();
    let fileName = "";
    if (normalized.includes("messi")) fileName = "messi.md";
    else if (normalized.includes("ronaldo")) fileName = "ronaldo.md";
    else if (normalized.includes("mbappe") || normalized.includes("mbappé")) fileName = "mbappe.md";
    else if (normalized.includes("haaland")) fileName = "haaland.md";
    else if (normalized.includes("argentina")) fileName = "argentina.md";
    else if (normalized.includes("brazil")) fileName = "brazil.md";

    if (!fileName) return "";

    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const filePath = path.join(knowledgeDir, fileName);
    if (!fs.existsSync(filePath)) return "";

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");

    const matchedContent: string[] = [];

    for (const targetSection of sections) {
      let insideSection = false;
      const sectionLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("## ")) {
          const header = line.replace("## ", "").toUpperCase().trim();
          if (header.includes(targetSection.toUpperCase())) {
            insideSection = true;
          } else {
            insideSection = false;
          }
        } else if (insideSection) {
          sectionLines.push(line);
        }
      }
      const sectionText = sectionLines.join("\n").trim();
      if (sectionText) {
        matchedContent.push(`### ${targetSection.toUpperCase()}\n${sectionText}`);
      }
    }

    return matchedContent.join("\n\n").trim() || fileContent.slice(0, 800);
  } catch (error) {
    console.error("getEntityMultiSectionContext error:", error);
    return "";
  }
}
