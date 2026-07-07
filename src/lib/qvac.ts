import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel,
} from "@qvac/sdk";

export interface DebateMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Abstraction for the Model Inference Layer, enabling easy swaps to future local runners
 */
export interface ModelProvider {
  /**
   * Loads the model into local memory. Returns the loaded model ID.
   */
  load(): Promise<string>;
  
  /**
   * Unloads the model to free up local RAM.
   */
  unload(): Promise<void>;

  /**
   * Generates a text response and streams back the tokens.
   */
  generateStream(prompt: string, history: DebateMessage[]): Promise<AsyncIterable<string>>;

  /**
   * Generates a full text response.
   */
  generateText(prompt: string, history: DebateMessage[]): Promise<string>;
}

// Global reference cache to persist the model reference between Next.js hot-reloads
const globalForQvac = global as unknown as {
  modelId: string | null;
  loadingPromise: Promise<string> | null;
};

if (typeof globalForQvac.modelId === "undefined") {
  globalForQvac.modelId = null;
}
if (typeof globalForQvac.loadingPromise === "undefined") {
  globalForQvac.loadingPromise = null;
}

export class QVACModelProvider implements ModelProvider {
  private modelSrc = LLAMA_3_2_1B_INST_Q4_0;

  async load(): Promise<string> {
    if (globalForQvac.modelId) {
      return globalForQvac.modelId;
    }

    if (globalForQvac.loadingPromise) {
      return globalForQvac.loadingPromise;
    }

    globalForQvac.loadingPromise = (async () => {
      console.log(`[QVAC] Initiating local model load: ${this.modelSrc}`);
      try {
        const id = await loadModel({
          modelSrc: this.modelSrc,
          modelType: "llm",
          onProgress: (progress) => {
            console.log(`[QVAC Load Progress] ${progress.percentage}% downloaded.`);
          },
        });
        globalForQvac.modelId = id;
        console.log(`[QVAC] Local model loaded successfully. ID: ${id}`);
        return id;
      } catch (err) {
        console.error("[QVAC] Error loading model:", err);
        globalForQvac.loadingPromise = null;
        throw err;
      }
    })();

    return globalForQvac.loadingPromise;
  }

  async unload(): Promise<void> {
    const id = globalForQvac.modelId;
    if (!id) {
      console.log("[QVAC] Model is not currently loaded.");
      return;
    }

    console.log(`[QVAC] Unloading model with ID: ${id}`);
    try {
      await unloadModel({ modelId: id });
      globalForQvac.modelId = null;
      globalForQvac.loadingPromise = null;
      console.log("[QVAC] Model unloaded successfully.");
    } catch (err) {
      console.error("[QVAC] Error unloading model:", err);
      throw err;
    }
  }

  async generateStream(prompt: string, history: DebateMessage[]): Promise<AsyncIterable<string>> {
    const modelId = await this.load();

    // Map custom history format into format expected by QVAC completion
    const qvacHistory = [
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      })),
      { role: "user", content: prompt }
    ];

    const totalPromptChars = qvacHistory.reduce((acc, curr) => acc + curr.content.length, 0);
    console.log(`[QVAC Prompt Length]: ${totalPromptChars} characters (history length: ${history.length} messages)`);

    try {
      const result = completion({
        modelId,
        history: qvacHistory,
        stream: true,
      });

      // Wrap QVAC's tokenStream iterator
      return result.tokenStream;
    } catch (err) {
      console.error("[QVAC] Completion streaming error:", err);
      throw err;
    }
  }

  async generateText(prompt: string, history: DebateMessage[]): Promise<string> {
    const stream = await this.generateStream(prompt, history);
    let fullText = "";
    for await (const token of stream) {
      fullText += token;
    }
    return fullText.trim();
  }
}

// Global singleton instance of the model provider
export const defaultModelProvider = new QVACModelProvider();
export async function getModelInstance(): Promise<QVACModelProvider> {
  return defaultModelProvider;
}
