# GOAT Arena specialized Agent Operations (Phase 3.2)

This document explains the runtime operations, explicit knowledge mappings, prompt structures, context window limits, and API request sequences.

---

## 🏃 Retrieval Layer Mapping (Removal of Global Retrieval)

To prevent data leaks from unrelated rivalries, the application uses explicit mappings linking teams/sides to their exact markdown database file:
- **Messi Side**: Coach uses `messi.md` | Opponent uses `ronaldo.md`
- **Ronaldo Side**: Coach uses `ronaldo.md` | Opponent uses `messi.md`
- **Mbappe Side**: Coach uses `mbappe.md` | Opponent uses `haaland.md`
- **Haaland Side**: Coach uses `haaland.md` | Opponent uses `mbappe.md`
- **Argentina Side**: Coach uses `argentina.md` | Opponent uses `brazil.md`
- **Brazil Side**: Coach uses `brazil.md` | Opponent uses `argentina.md`

The lookup is handled inside [retrieval.ts](file:///Users/pawaneswaran/Desktop/Work/HACKATHONS/Tether/SourceShield/goat-arena/src/lib/retrieval.ts) using `getEntityContext(entityName)`, which reads only the target file (up to 1300 characters) and avoids scanning other folder contents.

---

## 🎭 Agent Prompts & Context Assembly

### 1. Private Tactical Assistant (Tactical Coach)
- **Direct Queries Only**: The coach ignores debate history, opponent rebuttals, and game ticks. It responds only to the direct question entered in the Q&A box.
- **Strict Layout Headers**:
  - `KEY FACTS` (bulleted lists, max 6 bullets)
  - `ACHIEVEMENTS` (bulleted lists, max 6 bullets)
  - `COUNTERS` (bulleted lists, max 6 bullets)
  - `TACTICAL ADVICE` (bulleted lists, max 6 bullets)
- **Prompt Details**:
  ```
  You are a private football research assistant helping the user.
  Context: [SELECTED_ENTITY_KNOWLEDGE]
  User's Question: "[QUESTION]"

  You MUST format your output strictly in this exact structure, including the headers in caps. Always use bullet points (•), and write a maximum of 6 bullets per section.
  ```

### 2. AI Rival Legend (Opponent Agent)
- **Word Limits**: Constrained strictly to **20–60 words**.
- **Paragraph Rules**: Generates exactly **one single concise paragraph**. Essays, lists, and line breaks are banned.
- **UsedArguments Memory**: Scans history context to restrict repetition.
- **Prompt Details**:
  ```
  You are a competitive supporter of TEAM [RIVAL] vs [SIDE].
  Context: [RIVAL_ENTITY_KNOWLEDGE]
  History: [LAST_3_TURNS_TRUNCATED]
  User says: "[ARGUMENT]"

  [REPETITION_GUARD]

  Write a sharp rebuttal. Be competitive and aggressive.
  CRITICAL LIMITATIONS:
  - Keep your response strictly between 20 and 60 words.
  - Attack only one argument at a time.
  - Output exactly ONE single concise paragraph. Do NOT write multiple paragraphs, headers, or bullet points.
  ```

### 3. AI Arena Referee
- **Exchanges Summarization**: Compresses transcript items to 60 characters per round message to prevent context overflows.
- **Schema Validation**: Returns flat scores for Evidence, Logic, Persuasion, Countering, and Overall Performance. Employs a regex fallback parsing safety-net.
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
