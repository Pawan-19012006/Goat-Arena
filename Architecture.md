# GOAT Arena specialized Architecture (Phase 3.2)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.2 architecture maps knowledge files explicitly to players, converts the Tactical Coach into a private query-based assistant, and restricts the Opponent to concise single-paragraph rebuttals:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Direct User Query| CoachState[Private Assistant Q&A State]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  subgraph Agent Endpoints
    CoachState -->|Post Query / Side| CoachRoute[/api/agent/coach]
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
- **`getEntityContext(entityName)`**: Explicitly maps strings (Messi, Ronaldo, Mbappe, Haaland, Argentina, Brazil) to their profile `.md` file, avoiding search scans across unrelated database documents. Capped at 1300 characters.

### 2. Private Tactical Assistant
- **Scope**: Serves strictly as a private query assistant, ignoring timeline timeouts, debate feeds, and opponent history.
- **Header Blocks**: Output is structured under:
  - `KEY FACTS`
  - `ACHIEVEMENTS`
  - `COUNTERS`
  - `TACTICAL ADVICE`
- Bulleted lists only (max 6 bullets per section).
- **UI Element**: Shows only the last **User Question** and **Coach Response**, removing automated commentaries.

### 3. AI Rival Legend (Opponent Agent)
- **Scope**: Formulates aggressive counterarguments restricted to **20–60 words**.
- **Paragraph Rules**: Outputs exactly **one single paragraph** (no bullet points, headers, or line breaks).
- Uses keyword used-arguments to prevent repetition.
