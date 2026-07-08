# GOAT Arena Architecture (Phase 3.9)

GOAT Arena is built as a **local-first AI debate platform** running on-device using QVAC with a lightweight, 1-billion parameter instruct model.

---

## 🏗️ System Components

The Phase 3.9 architecture locks the UI layout to a fixed viewport, supports dynamic dual-side data binding, and implements a server-side validation retry loop:

```mermaid
graph TD
  UI[Debate Arena UI: 100vh Viewport Lock] -->|Loads sideId & opponentSideId JSONs| DataHooks[Dual Data Preloading: data & opponentData]
  DataHooks -->|Dynamic Binding| LeftCol[Left Stance Card: stats, description]
  UI -->|Argument Submission| DebateState[Debate Feed State]
  
  subgraph Viewport Layout Containment
    LeftCol
    CenterCol[Center Live Debate Feed Panel: overflow-y-auto]
    RightCol[Right Timeout Coach Panel: overflow-y-auto]
  end

  subgraph Input Validation & Retry Checkpoints
    DebateState -->|User Input| OpponentValidation{Is Greeting/Filler?}
    OpponentValidation -->|Yes: GREETING_BYPASS| UI
    OpponentValidation -->|No| OpponentPrompt[Advocate Prompt: Confident & Relentless]
    
    OpponentPrompt -->|Generate Rebuttal| SelfCheck{Praise User Side / Soft Concede?}
    SelfCheck -->|Yes: Attempt < 3| OpponentPrompt
    SelfCheck -->|Yes: Attempt = 3| FallbackSafeRebuttal[Load Safety Fallback Rebuttal]
    SelfCheck -->|No| UI
  end

  subgraph Post-Game Esports Analytics
    DebateState -->|Trigger Referee| RefAgent[/api/agent/referee]
    RefAgent -->|Explain Action| JSONVerdict[7-Section JSON Analytics Report]
    JSONVerdict -->|Render Esports Sheet Overlay| WinnerUI[Winner Screen Overlay]
  end
```

---

## 🧩 Component Details

### 1. Opponent Side Assignment & Validation Retry Loop
- **Dual JSON Loader**: Fetches `/data/${sideId}.json` and `/data/${opponentSideId}.json` at startup.
- **Stance Alignment**: Left column uses `opponentData` to display statistics and achievements dynamically.
- **Advocate Personality Prompts**: Opponent behaves as an unshakable football advocate, using the Challenge ➔ Counter-Evidence ➔ Closing response sequence.
- **Self-Validation retry loop**: Opponent API checks output for praise keywords, self-deprecating words, and soft-concessions. Repeats up to 3 times, falling back to a safe default profile statement if necessary.
- **Audit Debug Logs**: structured logs printed to server console:
  - `userSide`
  - `opponentSide`
  - `loadedContextFile`
  - `loadedEntity`

### 2. UI Layout Container Stability
- Root wrapper styled with `h-screen max-h-screen overflow-hidden flex flex-col`.
- Individual grid columns use `min-h-0 overflow-hidden flex flex-col`.
- Scroll logs inside lists are handled locally using `overflow-y-auto`, ensuring identical dimensions across all stages.

### 3. Explainable Referee JSON Verdict
- `/api/agent/referee` explain action compiles a detailed JSON verdict outlining:
  - `turningPoint` (quantitative pivot analysis)
  - `bestUserArg` & `bestOpponentArg` (quote, category, impact)
  - `weakestUserArg` & `weakestOpponentArg` (quote, reason)
  - `categoryBreakdown` (Evidence, Logic, Relevance, Persuasion text descriptions)
