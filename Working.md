# GOAT Arena Phase 2 Working Documentation

This document explains the runtime operations, prompt structures, memory persistence, context window optimizations, and API request sequences.

---

## 🏃 Model Lifecycle & Memory Control

To avoid the ~7-second cold start on every single round:
1. **Preloading**: When a user locks in a side (e.g. Messi) on `/select`, a request is fired in the background to `/api/model/control?action=load`. This loads the Llama model into RAM ahead of time.
2. **Persistence**: The server keeps the model loaded in local memory via a global reference singleton. Subsequent inference requests resolve in 1-2 seconds.
3. **Clean-up**: When the debate finishes or the user leaves the page, an API call is made to `/api/model/control?action=unload`. This calls `unloadModel` from the QVAC SDK and frees memory.

---

## 🔎 Retrieval Pipeline & Context Capping (1B Model Optimizations)

To fit prompt sizes within a local 1B parameters context window and prevent QVAC `CONTEXT_OVERFLOW` errors:
1. **Keyword Stripping**: The query is normalized (e.g. "Messi won the World Cup in 2022") and stripped of common stopwords (e.g. "the", "in", "and").
2. **Snippet-level Capping**: Instead of retrieving large files, the retrieval engine yields **exactly 1 block** (`limit = 1`) of matching text from `knowledge/` Markdown files.
3. **Text Truncation**: Retrieved snippets are strictly truncated to a maximum of **350 characters** before injection.
4. **Prompt Character-Length Logging**: Every generation call logs the complete character count of the assembled prompt to `stdout` right before triggering the inference call:
   ```typescript
   console.log(`[QVAC Prompt Length]: ${totalPromptChars} characters (history length: ${history.length} messages)`);
   ```

---

## 🎭 Agent Prompts & Context Assembly

All agent route handlers use custom instructions injected with retrieval context:

### 1. Analyst Agent Prompt
- **Context Restriction**: Receives only the last **1-2 messages** (the current turn) of debate history.
- **System Prompt**:
  ```
  You are AI Coach for Team [SIDE] vs [RIVAL].
  Context: [RETRIEVED_350_CHAR_CONTEXT]
  History: [LAST_2_MESSAGES]
  User says: "[ARGUMENT]"

  Provide:
  1. 1 key strength of user's argument.
  2. 1 loophole to defend.
  3. 1 statistical fact to cite.
  Keep bullets extremely concise. Max 100 words.
  ```

### 2. Opponent Agent Prompt
- **Context Restriction**: Receives only the last **1-2 messages** of history. (Maintains full history matching in memory to guard against repeating claims, but does not inject full transcripts into the active prompt window).
- **System Prompt**:
  ```
  You are a competitive supporter of TEAM [RIVAL] vs [SIDE].
  Context: [RETRIEVED_350_CHAR_CONTEXT]
  History: [LAST_2_MESSAGES]
  User says: "[ARGUMENT]"

  [REPETITION_GUARD_CLAIMS]

  Write a sharp rebuttal. Keep it under 100 words. No intro fluff. Start directly with the rebuttal.
  ```

### 3. Referee Agent Prompt
- **Full History**: Only the Referee receives the **complete 6-message debate transcript**.
- **System Prompt**:
  ```
  You are the Referee for the football debate: Team [SIDE] vs Team [RIVAL].
  Transcript: [FULL_TRANSCRIPT]

  Rate both sides 0-100 on Evidence, Logic, Persuasion, Countering, Consistency.
  Output ONLY a JSON block of this schema, no other text:
  {
    "scores": {
      "evidence": 85,
      "logic": 82,
      "persuasion": 88,
      "countering": 80,
      "consistency": 85
    },
    "round1": 80,
    "round2": 86,
    "round3": 92,
    "winner": "TEAM [SIDE]",
    "verdict": "Brief explanation of why they won under 100 words."
  }
  ```

---

## 🔄 The 3-Round Debate Sequence

The game loop is coordinated in the state engine on `/arena`:

```
User (locks in Team) ──> pre-loads Model ──> reads Arsenal stats
                                                    │
  ┌─────────────────────────────────────────────────┘
  ▼
Round 1: User Argument
  ├──> POST /api/agent/analyst ──> Streams Analyst coaching notes (100 words max)
  └──> POST /api/agent/opponent ──> Streams Opponent attack rebuttal (100 words max)
                                                    │
  ┌─────────────────────────────────────────────────┘
  ▼
Round 2: User response to Opponent attack
  ├──> POST /api/agent/analyst ──> Streams updated coaching notes (100 words max)
  └──> POST /api/agent/opponent ──> Streams second Opponent counterattack (100 words max)
                                                    │
  ┌─────────────────────────────────────────────────┘
  ▼
Round 3: User Final Rebuttal
  └──> POST /api/agent/opponent ──> Streams final Opponent defense (100 words max)
                                                    │
  ┌─────────────────────────────────────────────────┘
  ▼
Referee Verdict
  └──> POST /api/agent/referee ──> Receives full transcript ──> Displays Scoreboard & Winner
```
