# GOAT Arena Architecture (Phase 3.7)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.7 architecture incorporates a validation check-point, a deterministic lookup bypass, a query routing layer, and an updated telemetry debugger:

```mermaid
graph TD
  UI[Debate Arena UI] -->|Direct User Query| CoachState[Private Assistant State]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  subgraph Input Validation & Routing Checkpoints
    CoachState -->|Factual Lookup Request| CoachBypass{Deterministic Bypass?}
    CoachBypass -->|Yes| UI
    CoachBypass -->|No| CoachRouter[Classify Coach Intent: 7 Categories]
    
    DebateState -->|User Input| OpponentValidation{Is Greeting/Filler?}
    OpponentValidation -->|Yes: GREETING_BYPASS| UI
    OpponentValidation -->|No| OpponentRouter[Map User Claim to Rival Counter-Context]
  end

  subgraph Multi-Section Retrieval
    CoachRouter -->|Read Target Segments| KB[(13-Section markdown Files)]
    OpponentRouter -->|Read Target Segments| KB
  end

  subgraph Agent Endpoints
    CoachRouter & KB -->|Routed Context & Template| CoachRoute[/api/agent/coach]
    OpponentRouter & KB -->|Routed Context & Memory| OpponentRoute[/api/agent/opponent]
  end

  subgraph Local Core Services
    CoachRoute & OpponentRoute -->|Prompt execution| Model[Model Provider]
    Model -->|Local Exec| QVAC[QVAC SDK Engine]
    QVAC -->|Run GGUF| Llama3[Llama-3.2-1B-Instruct]
  end
```

---

## 🧩 Component Details

### 1. 13-Section markdown Profiles
- All player and team profiles standardized into exactly 13 sections: Origins, History, Country, Club Career, Records, Achievements, Managers, Major Tournaments, Recent Form, Strengths, Weaknesses, Debate Points, Counter Points.

### 2. Private Tactical Assistant (Coach Agent)
- Unlocked *only* during timeouts.
- **Deterministic Facts Lookup**: Bypass model execution for country, age, club, goals, trophies, world cups, ballon d'or counts, managers, and history. Answer instantly.
- **Intent-based Templates**: Standard templates for `FACT`, `HISTORY`, `ACHIEVEMENT`, `SUPPORT_POINTS`, `COUNTER_ARGUMENT`, `WEAKNESSES`, `TACTICAL_ADVICE`, limiting replies to 1-3 sentences.

### 3. AI Rival Legend (Opponent Agent)
- **Greeting Validation Check**: Detects greeting/fillers (e.g. "hello", "hi", "ok") and prompts user to state case in character.
- **Anti-Leakage prompt Rules**: Banned words: "User", "Claim", "Rebuttal", "Debate structure", "User's claim", "Acknowledge the point", "Counter", "Conclusion".
- **Rebuttal limits**: Restricted to **15-50 words** in one paragraph.
- **Topic Memory**: Prevent repeated arguments using the telemetry memory list.

### 4. Telemetry observed metrics
- Render debug grid containing prompt length, retrieval size, network latency, detected intent, selected sections, active files, and topic memory maps.
