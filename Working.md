# GOAT Arena gameplay & State Operations (Phase 3.6)

This document explains the query-routing layer, segmented knowledge profiles, strategic coach intent responses, opponent structured rebuttals, and topic repetition memory.

---

## 🔎 Segmented Knowledge Profiles & Query Routing

To prevent the AI from receiving irrelevant or oversized context, the database is divided into segmented subheaders and matched using keyword query-routing:

### 1. Database Subheaders (`knowledge/`)
Each profile file contains:
- `## HISTORY` (birth, origins, academy, transfers, eras)
- `## RECORDS` (specific record numbers, goals, assists)
- `## ACHIEVEMENTS` (trophies, awards, World Cups)
- `## TACTICS` (positions, roles, style of play)
- `## WEAKNESSES` (work rate, physical pace decline, transition gaps)

### 2. Multi-Section Retrieval Layer (`src/lib/retrieval.ts`)
The helper `getEntityMultiSectionContext(entityName, sections)` extracts and merges multiple markdown segments:
- **`SUPPORT_POINTS`** ➔ Reads `RECORDS` and `ACHIEVEMENTS`
- **`COUNTER_ARGUMENTS`** ➔ Reads `TACTICS` and `WEAKNESSES`
- **`HISTORY`** ➔ Reads `HISTORY`
- **`ACHIEVEMENTS`** ➔ Reads `ACHIEVEMENTS`
- **`WEAKNESSES`** ➔ Reads `WEAKNESSES`
- **`FACTS`** ➔ Reads `RECORDS`
- **`DEBATE_STRATEGY`** ➔ Reads `TACTICS`

---

## 🎓 Dedicated Coach Prompt Templates

Based on the detected intent, `/api/agent/coach/route.ts` selects a dedicated prompt template:
- **`SUPPORT_POINTS`**: 3 to 5 bullet points supporting the selected side (each under 12 words).
- **`COUNTER_ARGUMENTS`**: 1-2 direct sentences countering the rival (under 30 words).
- **`HISTORY`**: Factual 1-2 sentence replies about history (no coach tactics).
- **`FACTS`**: 1-2 sentence replies answering statistical queries.
- **`ACHIEVEMENTS`**: Lists only trophies/honors (under 2 sentences).
- **`WEAKNESSES`**: Flaws/vulnerabilities (1-2 sentences).
- **`DEBATE_STRATEGY`**: 1-2 sentences of tactical focus advice.

---

## 🥊 Structured AI Opponent Rebuttals

- Required sequence: **Acknowledge User Point ➔ Challenge with Statistics ➔ Punchy Conclusion**.
- Limits length strictly to **50 words max** in one single paragraph.

---

## 🧠 Memory topic repetition Guard

- Tracks previously discussed topic triggers (`world_cups`, `recent_form`, `defense`, `squad_depth`, `manager`, `star_players`) in the history transcript to instruct the AI opponent to focus on other angles.
