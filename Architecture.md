# GOAT Arena Architecture (Phase 3.4)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.4 architecture separates scoring from final verdict reasoning to ensure the Referee system is deterministic and free from hallucinations:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Direct User Query| CoachState[Private Assistant State]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  DebateState -->|1. Submit Exchange| ScoreRoute[/api/agent/referee - action: score]
  ScoreRoute -->|2. Return 0-10 Scores| RunningScoreboard[Update runningScores State]

  RunningScoreboard -->|3. Compile at End| SumChecker{Calculate Winner Mathematically}
  
  SumChecker -->|4. Request Explanation| ExplainRoute[/api/agent/referee - action: explain]
  ExplainRoute -->|5. Return Explanation| UIVerdict[Display Final Scoreboard & Explanation]

  subgraph Local Core Services
    CoachRoute[/api/agent/coach] -->|Load Selected Side File| Retrieval[Entity retrieval Mappings]
    ScoreRoute -->|Load Selected Rival File| Retrieval
    Retrieval -->|File Read| KB[(Selected Markdown Knowledge File Only)]
    
    CoachRoute & ScoreRoute & ExplainRoute -->|Prompt execution| Model[Model Provider]
    Model -->|Local Exec| QVAC[QVAC SDK Engine]
    QVAC -->|Run GGUF| Llama3[Llama-3.2-1B-Instruct]
  end
```

---

## 🧩 specialized Component Details

### 1. Entity-to-File Mappings (`src/lib/retrieval.ts`)
- Maps side/rival strings directly to target profile `.md` files, capped at 1300 characters.

### 2. Private Tactical Assistant (Strategic Timeout Advisor)
- Unlocked *only* during timeouts (`TIMEOUT_1`, `TIMEOUT_2`). Transitioning out of timeouts wipes query/response states.
- Restricts coach responses to exactly **1 or 2 short sentences** of strategic guidance.

### 3. AI Rival Legend (Opponent Agent)
- Constrained strictly to **15–40 words** formatted as a single paragraph.
- Uses `usedTopics` check against transcript history to pivot topics.

### 4. Deterministic AI Referee (`src/app/api/agent/referee/route.ts`)
- **`action: "score"`**: Grades a single statement exchange on a 0-10 scale for Side A and Side B.
- **Winner Summation**: Aggregates running scoreboard sums in React state to identify the winner mathematically.
- **`action: "explain"`**: Takes the calculated winner and scores, and generates a structured verdict summary under 120 words.
