# GOAT Arena gameplay & State Operations (Phase 3.7)

This document explains the input validation, deterministic lookup bypass, query-routing layer, strategic coach intent responses, opponent structured rebuttals, and topic repetition memory.

---

## 🔎 Segmented Knowledge Profiles & Query Routing

To prevent the AI from receiving irrelevant or oversized context, the database is divided into segmented subheaders and matched using keyword query-routing:

### 1. Database Subheaders (`knowledge/`)
Each profile file contains exactly these 13 sections:
- `# Origins`
- `# History`
- `# Country`
- `# Club Career`
- `# Records`
- `# Achievements`
- `# Managers`
- `# Major Tournaments`
- `# Recent Form`
- `# Strengths`
- `# Weaknesses`
- `# Debate Points`
- `# Counter Points`

### 2. Multi-Section Retrieval Layer (`src/lib/retrieval.ts`)
The helper `getEntityMultiSectionContext(entityName, sections)` extracts and merges multiple markdown segments matching the `# ` headers.

---

## 🎓 Tactical Coach Query Routing

### 1. Deterministic Facts Lookup
For questions regarding `country`, `age`, `club`, `goals`, `trophies`, `world cups`, `ballon d'or counts`, `managers`, and `history`, the endpoint immediately answers directly from a structured mapping list. It bypasses AI model execution completely, guaranteeing zero hallucination.

### 2. Intent-based Routing & Prompts
For non-deterministic questions, the coach routes the query to one of the templates based on detected intent (`FACT`, `HISTORY`, `ACHIEVEMENT`, `SUPPORT_POINTS`, `COUNTER_ARGUMENT`, `WEAKNESSES`, `TACTICAL_ADVICE`), limiting output to 1-3 sentences or 3-4 bullets.

---

## 🥊 AI Opponent Rebuttals & Validation

### 1. Non-Argument Validation
If the user inputs a short statement, greeting, or filler (e.g. "hello", "hi", "ok"), the Opponent bypasses standard rebuttals and prompts the user to state their case in character.

### 2. Anti-Leakage Constraints
The Opponent prompt explicitly bans using metalanguage structures such as: "User's claim", "User", "Claim", "Rebuttal", "Debate structure", "Acknowledge the point", "Counter", and "Conclusion".

### 3. Rebuttal constraints
- Limits length strictly to **15-50 words** in exactly one paragraph.
- Matches user topics against topic repetition memory to ensure argument diversity.
