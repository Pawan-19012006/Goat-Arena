# GOAT Arena gameplay & State Operations (Phase 3.3)

This document explains the gameplay states, strategic timeouts, timeout coach accessibility, prompt layouts, and opponent anti-repetition memory.

---

## 🏃 Retrieval Layer Mapping

Mappings link teams/sides directly to their database profile file, preventing statistical leaks:
- **Messi Side**: Coach loads `messi.md` | Opponent loads `ronaldo.md`
- **Ronaldo Side**: Coach loads `ronaldo.md` | Opponent loads `messi.md`
- **Mbappe Side**: Coach loads `mbappe.md` | Opponent loads `haaland.md`
- **Haaland Side**: Coach loads `haaland.md` | Opponent loads `mbappe.md`
- **Argentina Side**: Coach loads `argentina.md` | Opponent loads `brazil.md`
- **Brazil Side**: Coach loads `brazil.md` | Opponent loads `argentina.md`

`getEntityContext(entityName)` in [retrieval.ts](file:///Users/pawaneswaran/Desktop/Work/HACKATHONS/Tether/SourceShield/goat-arena/src/lib/retrieval.ts) reads only the target profile file (truncated to 1300 characters).

---

## ⏱️ Strategic Timeout Coach Locks & Visibility

To ensure the user forms their own arguments, the Coach panel accessibility behaves as follows:
1. **Locked Screen**: When the debate round is active (`ROUND_1`, `ROUND_2`, `ROUND_3`, `ARSENAL` or `REFEREE`), the Right Column is locked, displaying: *"Coach Finch is only available during Strategic Timeouts. Focus on the live debate feed."*
2. **Access State**: The Coach is unlocked *only* during timeouts (`TIMEOUT_1`, `TIMEOUT_2`).
3. **Wipe advice on Timeout End**: Transitioning out of timeouts clears `lastCoachQuestion` and `lastCoachResponse` to ensure advice cannot be referenced during active debate.

---

## 🎭 Agent Prompts & Context Assembly

### 1. Private Tactical Assistant (Strategic Timeout Advisor)
- **Prompt Details**:
  ```
  You are a private tactical football coach advising your client on the Team [SIDE] side.
  Context (factual info about your team):
  [SELECTED_ENTITY_KNOWLEDGE]

  User's Question: "[QUESTION]"

  Write exactly 1 or 2 short sentences of strategic guidance. Do NOT write bullet points, list items, statistics, or full arguments that can be copied. Guide the user on what angle/statistic to focus on or avoid. Keep it extremely brief.
  ```

### 2. AI Rival Legend (Opponent Agent)
- **Word Limits**: 15–40 words max.
- **Paragraph Rules**: Exactly one single concise paragraph (no lists/line breaks).
- **usedTopics Memory**: Scans history to identify already-discussed topics:
  - `world_cups` (World Cup statistics)
  - `recent_form` (Streak, current form)
  - `defense` (Defender blocks, backline)
  - `squad_depth` (Bench volume)
  - `manager` (Coach tactics)
  - `star_players` (Ballon d'Or honors)
- **Prompt Details**:
  ```
  You are a competitive supporter of TEAM [RIVAL] vs [SIDE].
  Context (factual info about your team):
  [RIVAL_ENTITY_KNOWLEDGE]

  History:
  [LAST_3_TURNS_TRUNCATED]
  User says: "[ARGUMENT]"

  [REPETITION_GUARD]

  Write a sharp, competitive rebuttal.
  CRITICAL CONSTRAINTS:
  - Keep your response strictly between 15 and 40 words.
  - Attack only one User argument at a time.
  - Output exactly ONE single concise paragraph. Do NOT write multiple paragraphs, headers, or bullet points.
  ```

### 3. AI Referee
- Flat JSON structure scoring Evidence, Logic, Persuasion, Countering, and Overall Performance.
