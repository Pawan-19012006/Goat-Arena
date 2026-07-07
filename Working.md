# GOAT Arena Phase 3.1 Working Documentation

This document explains the runtime operations, prompt structures, memory persistence, context window optimizations, and API request sequences.

---

## 🏃 Model Lifecycle & Memory Control

To avoid the ~7-second cold start on every single round:
1. **Preloading**: When a user locks in a side (e.g. Messi) on `/select`, a request is fired in the background to `/api/model/control?action=load`. This loads the Llama model into RAM ahead of time.
2. **Persistence**: The server keeps the model loaded in local memory via a global reference singleton. Subsequent inference requests resolve in 1-2 seconds.
3. **Clean-up**: When the debate finishes or the user leaves the page, an API call is made to `/api/model/control?action=unload`. This calls `unloadModel` from the QVAC SDK and frees memory.

---

## 🔎 Retrieval Pipeline & prioritized Name Scanning

To fit prompt sizes within a local 1B parameters context window and prevent QVAC `CONTEXT_OVERFLOW` errors:
1. **Name Prioritization**: The search query is scanned for target name tags (e.g. "Ronaldo", "Messi"). If a player profile matches, the retrieval engine prioritize scanning that target file, regardless of which team the user supports.
2. **Score Boosting**: Match blocks belonging to the prioritized player file receive a `+10` score boost to shoot to the top of the search rankings.
3. **Profile Fallback**: If no keywords match, the retrieval engine fallback-loads the first block (Profile Accolades Overview) of the prioritized player's file to ensure the AI always has stats.
4. **Capped snippet-size**: Returns up to **3 matching blocks** (each block sliced at 450 characters), with a combined context ceiling strictly capped at **1300 characters**.
5. **Prompt Observability Logging**: Every route handler logs prompt size and match contents:
   ```typescript
   console.log("Prompt Length:", prompt.length);
   console.log("Retrieved Context:", context);
   ```

---

## 🎭 Agent Prompts & Context Assembly

All agent route handlers use custom instructions injected with retrieval context:

### 1. AI Tactical Coach Agent
- **Context Restriction**: Receives only the last **2 messages** of history.
- **Structure Enforcement**: Prompt instructs the coach to format text strictly under four uppercase headers: `FACTS`, `ACHIEVEMENTS`, `COUNTERPOINTS`, and `TACTICAL ADVICE`.
- **System Prompt**:
  ```
  You are the AI Tactical Coach helping Team [SIDE] defeat [RIVAL].
  Context: [RETRIEVED_CONTEXT_1300_CHARS_MAX]
  History: [LAST_2_MESSAGES]

  [INSTRUCTIONS_OR_QUESTION]
  Never refuse normal football discussion. Keep your response supportive and extremely concise (max 120 words).
  You MUST format your output in this exact structure, including the headers in caps:
  FACTS
  - ...
  ACHIEVEMENTS
  - ...
  COUNTERPOINTS
  - ...
  TACTICAL ADVICE
  - ...
  ```

### 2. AI Rival Legend Agent
- **Context Restriction**: Receives only the last **3 messages** of history.
- **UsedArguments Memory**: Scans the transcript history dynamically to index previous focus areas. Builds a lightweight `usedArguments` list (e.g. UCL goals, Ballon d'Ors) and instructs the model:
  ```
  DO NOT repeat or focus on these already used topics: [USED_ARGUMENTS]. Pivot to a different statistics or trophy angle.
  ```
- **System Prompt**:
  ```
  You are a competitive supporter of TEAM [RIVAL] vs [SIDE].
  Context: [RETRIEVED_CONTEXT_1300_CHARS_MAX]
  History: [LAST_3_MESSAGES]
  User says: "[ARGUMENT]"

  [REPETITION_GUARD]

  Write a sharp rebuttal. Be competitive and aggressive. Keep it under 100 words. No intro fluff. Start directly with the rebuttal.
  ```

### 3. AI Arena Referee Agent
- **Exchange Summarization**: Instead of raw transcripts, the Referee receives a highly compact summary of the debate exchanges (first 120 characters per user/opponent message), avoiding context overflow.
- **Output Validation**: Instructs the model to output a flat JSON schema. Safe try/catch wrapper parses the JSON, falls back to a regex fallback parser, and generates a preformatted backup verdict if the model outputs malformed JSON.
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

## ⚙️ Developer Diagnostics (Debug Mode)

The UI includes a toggleable **QVAC Debug Mode** panel in the HUD header. When active, it displays:
- **Prompt Length**: characters count read from the custom HTTP response header `x-prompt-length`.
- **Retrieval Size**: characters size read from the HTTP response header `x-retrieval-length`.
- **Latency Speed**: milliseconds taken to stream the response (computed via `performance.now()`).
- **Retrieved Clippings**: base64-decoded context text samples read from `x-retrieved-snippets`.
