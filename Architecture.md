# GOAT Arena Architecture (Phase 3.3)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.3 gameplay re-architecture introduces strategic timeout locks on the coach assistant, narrows opponent rebuttals to 15-40 words, and implements a topic-based memory guard:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Direct User Query| CoachState[Private Assistant State]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  subgraph Stage Checks
    UI -->|Check activeStep| LockCheck{Is Timeout active?}
    LockCheck -->|Yes| UnlockCoach[Render Ask Box & Q&A Board]
    LockCheck -->|No| LockCoach[Render Locked Screen, Clear Advice States]
  end

  subgraph Agent Endpoints
    UnlockCoach -->|Post Query / Side| CoachRoute[/api/agent/coach]
    DebateState -->|Post Argument / History| OpponentRoute[/api/agent/opponent]
  end

  subgraph Local Core Services
    CoachRoute -->|Load Selected Side File| Retrieval[Entity retrieval Mappings]
    OpponentRoute -->|Load Selected Rival File| Retrieval
    Retrieval -->|File Read| KB[(Selected Markdown Knowledge File Only)]
    
    CoachRoute & OpponentRoute -->|Prompt execution| Model[Model Provider]
    Model -->|Local Exec| QVAC[QVAC SDK Engine]
    QVAC -->|Run GGUF| Llama3[Llama-3.2-1B-Instruct]
  end
```

---

## 🧩 specialized Component Details

### 1. Entity-to-File Mappings (`src/lib/retrieval.ts`)
- Explicitly maps sides/rivals directly to their profile `.md` file, avoiding search scans across unrelated database documents. Capped at 1300 characters.

### 2. Private Tactical Assistant (Strategic Timeout Advisor)
- **Availability**: Unlocked *only* during timeouts (`TIMEOUT_1`, `TIMEOUT_2`). Displays a locked panel state during active rounds.
- **Wipe States**: Clearing out of a timeout wipes query and strategic advice state variables to prevent reference during live rounds.
- **Guidance**: Output is restricted strictly to **1 or 2 short sentences** of high-level strategic direction (no copy-pasteable arguments or bulleted statistic lists).

### 3. AI Rival Legend (Opponent Agent)
- **Scope**: Formulates aggressive rebuttals restricted strictly to **15–40 words**.
- **Paragraph Rules**: Outputs exactly **one single paragraph** (no bullet points, headers, or line breaks).
- **usedTopics Memory**: Detects discussed topics (`world_cups`, `recent_form`, `defense`, `squad_depth`, `manager`, `star_players`) in transcript history, forcing the model to pivot to different angles.
