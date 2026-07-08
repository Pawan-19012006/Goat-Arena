# GOAT Arena Architecture (Phase 3.6)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.6 architecture incorporates a query routing layer that dynamically slices knowledge files into sections, loading only the relevant category segment and executing dedicated prompts:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Direct User Query| CoachState[Private Assistant State]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  subgraph Query Routing Layer
    CoachState -->|User Query| Router[getEntityMultiSectionContext]
    DebateState -->|User Argument| Router
    Router -->|Check keywords| SectionDetect{Classify Coach Intent: 7 Categories}
    SectionDetect -->|Select Template| PromptTemplate[Dedicated Prompt Selection]
    SectionDetect -->|Read Target Segment| KB[(Segmented Markdown Files)]
  end

  subgraph Agent Endpoints
    CoachState & PromptTemplate -->|routed Context & Template| CoachRoute[/api/agent/coach]
    DebateState -->|routed Context| OpponentRoute[/api/agent/opponent]
  end

  subgraph Local Core Services
    CoachRoute & OpponentRoute -->|Prompt execution| Model[Model Provider]
    Model -->|Local Exec| QVAC[QVAC SDK Engine]
    QVAC -->|Run GGUF| Llama3[Llama-3.2-1B-Instruct]
  end
```

---

## 🧩 Component Details

### 1. Reorganized Database Profiles
- All six profile files segmented under standardized `## HISTORY`, `## RECORDS`, `## ACHIEVEMENTS`, `## TACTICS`, and `## WEAKNESSES` subheaders.

### 2. Query Routing Layer (`src/lib/retrieval.ts`)
- Matches questions dynamically to markdown headers, extracting *only* that subsection. Reduces prompt context to ~200-400 characters, leading to high-performance local inference.

### 3. Private Tactical Assistant (Strategic Timeout Advisor)
- Unlocked *only* during timeouts. Transitioning out of timeouts clears state variables.
- Intent classification determines which prompt template is selected (`SUPPORT_POINTS`, `COUNTER_ARGUMENTS`, `HISTORY`, `FACTS`, `ACHIEVEMENTS`, `WEAKNESSES`, `DEBATE_STRATEGY`), routing questions to custom answers.

### 4. AI Rival Legend (Opponent Agent)
- Rebuttals directly challenge the user's latest claim.
- Structured format: **Acknowledge ➔ Counter ➔ Conclusion**.
- Limits response to **50 words max** in one single paragraph.
- Employs topic repetition guards.

### 5. Deterministic AI Referee
- Mathematical score aggregation (0-10 on each exchange). AI referee compiles verdict explanation based on computed winner.
