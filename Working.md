# GOAT Arena gameplay & State Operations (Phase 3.5)

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

### 2. Query Routing Layer (`src/lib/retrieval.ts`)
The routing helper `getEntitySectionContext(entityName, query)` checks the query keywords:
- If history/timeline ➔ routes to `HISTORY`
- If records/statistics ➔ routes to `RECORDS`
- If trophies/cups ➔ routes to `ACHIEVEMENTS`
- If beat/fail/weakness ➔ routes to `WEAKNESSES`
- Default ➔ routes to `TACTICS`
It extracts only the matching section text (~200–400 characters), keeping prompt size minimal.

---

## 🎓 Strategic coach Query Classification

- **Prompt Guidelines**:
  - Classifies query intent based on routed category context.
  - Answers factually if the question is historical/factual, rather than forcing a Scaloni tactic.
  - Constrains response length strictly to **1 or 2 sentences** (no list items or bullet points).

---

## 🥊 Structured AI Opponent Rebuttals

- **Prompt Guidelines**:
  - Directs the model to address the user's latest claim directly: `${argument}`. Banned from changing topics.
  - Required sequence: **Acknowledge User Point ➔ Challenge with Statistics ➔ Punchy Conclusion**.
  - Limits length strictly to **50 words max** in one single paragraph.

---

## 🧠 Memory topic repetition Guard

- Tracks previously discussed topic triggers (`world_cups`, `recent_form`, `defense`, `squad_depth`, `manager`, `star_players`) in the history transcript to instruct the AI opponent to focus on other angles.
