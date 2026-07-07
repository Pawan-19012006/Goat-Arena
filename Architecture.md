# GOAT Arena Phase 2 Architecture

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC (Quantum Vector AI Core) with a lightweight, 1-billion parameter instruct model (`Llama-3.2-1B-Instruct-Q4_0`).

---

## 🏗️ System Components

The Phase 2 architecture separates model running, factual retrieval, state coordination, and UI representation into distinct layers:

```mermaid
graph TD
  UI[Debate Arena UI] -->|User Argument / Action| State[Debate State Manager]
  State -->|Fetch Route Handlers| API[Next.js API Route Layer]
  
  subgraph Agent Routes
    API -->|Prompt & History| AnalystRoute[/api/agent/analyst]
    API -->|Prompt & History| OpponentRoute[/api/agent/opponent]
    API -->|Full Transcript| RefereeRoute[/api/agent/referee]
    API -->|Control Hooks| ModelRoute[/api/model/control]
  end

  subgraph Local Core Services
    AnalystRoute & OpponentRoute & RefereeRoute -->|Retrieve Context| Retrieval[Retrieval Provider]
    Retrieval -->|Keyword Match scan| KB[(Markdown Knowledge Base)]
    
    AnalystRoute & OpponentRoute & RefereeRoute -->|Inference request| Model[Model Provider]
    Model -->|Local Exec| QVAC[QVAC SDK Engine]
    QVAC -->|Run GGUF| Llama3[Llama-3.2-1B-Instruct]
  end
  
  ModelRoute -->|Load / Unload| Model
```

---

## 🧩 Key Abstractions

### 1. Model Provider (`src/lib/qvac.ts`)
- **`ModelProvider` Interface**: Abstracts the LLM compilation. Allows seamless swaps between local engines and different GGUF weights.
- **`QVACModelProvider`**: Integrates `@qvac/sdk`. Solves local development hot-reload leaks by registering the active `modelId` as a server-side global singleton, preventing double model loads.
- **Prompt Size Monitoring**: Automatically calculates and prints character lengths to `stdout` right before completing any task, alerting developers of potential context overflow hazards.

### 2. Retrieval Provider (`src/lib/retrieval.ts`)
- **`RetrievalProvider` Interface**: Decouples search logic. This makes it trivial to replace simple keyword search with a vector store/embeddings system later.
- **`MarkdownKeywordRetrieval`**: Scans the `knowledge/*.md` directory, tokenizes queries, ranks blocks by keyword matches, yields a maximum of **1 matching block** and truncates it to **350 characters** before returning, conserving context window space.

---

## 🤖 The AI Agents (1B Context Optimized)

To prevent `CONTEXT_OVERFLOW` errors on small-memory devices, prompts and history structures are sized tightly:

### 1. AI Analyst (Tactical Coach)
- **Objective**: Assist the user in building arguments.
- **Context Limit**: Only receives the last **1-2 turns** (user/opponent dialog) of history.
- **Prompt Size**: Under 200 words, strictly instructing a concise bullet response of under 100 words.

### 2. AI Opponent (Rival Legend)
- **Objective**: Defend the opposing side and challenge the user.
- **Context Limit**: Only receives the last **1-2 turns** of history. (Keeps an out-of-prompt string list of previous argument outlines to prevent repetition without filling the model's active window).
- **Prompt Size**: Under 200 words, strictly requesting a direct rebuttal under 100 words.

### 3. AI Referee (Arena Referee)
- **Objective**: Neutrally evaluate the entire debate transcript.
- **Context Limit**: Receives the **full transcript** (6 statement exchanges).
- **Prompt Size**: Short instructions requesting a JSON payload containing ratings and a verdict under 100 words.
