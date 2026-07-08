# GOAT Arena Architecture (Phase 3.5)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.5 architecture incorporates a query routing layer that dynamically slices knowledge files into sections (History, Records, Achievements, Tactics, Weaknesses), loading only the relevant category segment to keep prompt contexts small and reasoning quality high:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Direct User Query| CoachState[Private Assistant State]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  subgraph Query Routing Layer
    CoachState -->|User Query| Router[getEntitySectionContext]
    DebateState -->|User Argument| Router
    Router -->|Check keywords| SectionDetect{History, Records, Achievements, Tactics, Weaknesses}
    SectionDetect -->|Read Target Segment| KB[(Segmented Markdown Files)]
  end

  subgraph Agent Endpoints
    CoachState -->|routed Segment Context| CoachRoute[/api/agent/coach]
    DebateState -->|routed Segment Context| OpponentRoute[/api/agent/opponent]
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
- Outputs **1 or 2 sentences** matching user's intent section (fact/history/strategy).

### 4. AI Rival Legend (Opponent Agent)
- Rebuttals directly challenge the user's latest claim.
- Structured format: **Acknowledge ➔ Counter ➔ Conclusion**.
- Limits response to **50 words max** in one single paragraph.
- Employs topic repetition guards.
