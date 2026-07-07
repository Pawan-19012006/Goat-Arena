# GOAT Arena Phase 3.1 Architecture

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC (Quantum Vector AI Core) with a lightweight, 1-billion parameter instruct model (`Llama-3.2-1B-Instruct-Q4_0`).

---

## 🏗️ System Components

The Phase 3.1 architecture consolidates all steps into a single `/arena` route using a responsive 3-column grid structure with a clear typography scale and debugging support:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Toggle Debug Mode| DebugDeck[Developer Debug Deck]
  UI -->|User Argument / Action| State[Debate State Manager]
  State -->|Fetch HTTP Streams| API[Next.js API Route Layer]
  
  subgraph Agent Routes
    API -->|Prompt & History| CoachRoute[/api/agent/coach]
    API -->|Prompt & History| OpponentRoute[/api/agent/opponent]
    API -->|Summarized Exchanges| RefereeRoute[/api/agent/referee]
    API -->|Control Hooks| ModelRoute[/api/model/control]
  end

  subgraph Local Core Services
    CoachRoute & OpponentRoute -->|prioritized Name Search| Retrieval[Retrieval Provider]
    Retrieval -->|Keyword Match scan| KB[(Markdown Knowledge Base)]
    
    CoachRoute & OpponentRoute & RefereeRoute -->|Inference request| Model[Model Provider]
    Model -->|Local Exec| QVAC[QVAC SDK Engine]
    QVAC -->|Run GGUF| Llama3[Llama-3.2-1B-Instruct]
  end
  
  ModelRoute -->|Load / Unload| Model
  API -->|Telemetry Headers| DebugDeck
```

---

## 🧩 Key Abstractions

### 1. Model Provider (`src/lib/qvac.ts`)
- **`ModelProvider` Interface**: Abstracts the LLM compilation. Allows seamless GGUF model loading and unloading.
- **`QVACModelProvider`**: Integrates `@qvac/sdk`. Solves local development hot-reload leaks by registering the active `modelId` as a server-side global singleton, preventing double model loads.
- **Prompt Size Monitoring**: Automatically calculates and prints character lengths to `stdout` right before completing any task, alerting developers of potential context overflow hazards.

### 2. Retrieval Provider (`src/lib/retrieval.ts`)
- **Name-Prioritized Retrieval**: Scans search strings for names (e.g. "Ronaldo", "Messi") to isolate target markdown files.
- **Match Score Boost**: Applies a `+10` score boost to blocks inside matching player files, prioritizing them.
- **Fallback Loading**: Fallback-loads the first block (Profile Summary) if no search keywords match.
- **Capped snippet-size**: Returns up to **3 blocks** (each block truncated to 450 characters) and caps the combined result string length strictly at **1300 characters**.

---

## 🤖 The AI Agents (1B Context Optimized)

Prompts, histories, and layouts are scaled to maximize 1B model quality:

### 1. AI Tactical Coach
- **Visual Stave**: Right Column (`lg:col-span-3` - 25% width).
- **History Limits**: Last **2 messages** of history.
- **Prompt Structure**: Prompt instructs the coach to format text strictly under four uppercase headers: `FACTS`, `ACHIEVEMENTS`, `COUNTERPOINTS`, and `TACTICAL ADVICE` (max 120 words).
- **Direct Q&A**: Supports typing direct questions at any time, returning supportive stats without criticizing the user.

### 2. AI Rival Legend
- **Visual Stave**: Left Column (`lg:col-span-2` - 16.7% width).
- **History Limits**: Last **3 messages** of history.
- **UsedArguments Memory**: Scans previous exchanges dynamically to prevent repeating topics.
- **Rebuttal Size**: Competitive and aggressive statements kept strictly under 100 words.

### 3. AI Arena Referee
- **Focal Overlay**: Reveals scores directly on-screen at the end of Round 3.
- **Transcript Summarization**: Receives a summarized transcript containing the first 120 characters per user/opponent message, avoiding `CONTEXT_OVERFLOW`.
- **Flat JSON & Parsing Safe-Net**: Enforces a flat JSON schema. Employs a robust try/catch validator and a backup regex/verdict generator to guarantee the referee route never crashes.
- **Flat JSON Schema**:
  ```json
  {
    "winner": "Messi",
    "winnerSide": "MESSI",
    "evidenceScore": 88,
    "logicScore": 84,
    "persuasionScore": 90,
    "counteringScore": 85,
    "overallScore": 87,
    "verdict": "Explanation..."
  }
  ```

---

## 🎨 Layout and Sizing Typography Scale

To elevate usability, the page splits widths to **2:7:3** to maximize center debate view space:
- **Rival Panel**: `lg:col-span-2` (16.7% width)
- **Debate Arena**: `lg:col-span-7` (58.3% width)
- **Coach Panel**: `lg:col-span-3` (25.0% width)

The typography scale is enlarged globally:
- **Body text / Stats descriptions**: `text-base` or `text-lg` (16px–18px)
- **Dialogue chat bubbles**: `text-lg md:text-[19px]` (18px–20px)
- **Section headers**: `text-xl` to `text-2xl` (24px–32px)
- **Major headings / Scoreboards**: `text-4xl md:text-5xl` (40px+)
