# GOAT Arena referee & State Operations (Phase 3.4)

This document explains the split Referee evaluation architecture, background exchange scoring, mathematical winner calculation, and final explanation compilations.

---

## 🏃 Retrieval Mappings

Explicit mappings link sides directly to their database profile file to prevent cross-debate leaks:
- **Messi Side**: Coach uses `messi.md` | Opponent uses `ronaldo.md`
- **Ronaldo Side**: Coach uses `ronaldo.md` | Opponent uses `messi.md`
- **Mbappe Side**: Coach uses `mbappe.md` | Opponent uses `haaland.md`
- **Haaland Side**: Coach uses `haaland.md` | Opponent uses `mbappe.md`
- **Argentina Side**: Coach uses `argentina.md` | Opponent uses `brazil.md`
- **Brazil Side**: Coach uses `brazil.md` | Opponent uses `argentina.md`

`getEntityContext(entityName)` in [retrieval.ts](file:///Users/pawaneswaran/Desktop/Work/HACKATHONS/Tether/SourceShield/goat-arena/src/lib/retrieval.ts) loads only the selected entity knowledge file (truncating content to 1300 characters).

---

## ⏱️ Strategic Timeout Coach Locks

The Coach panel is unlocked *only* during timeouts (`TIMEOUT_1`, `TIMEOUT_2`). Outside timeouts, the panel is locked and clear transitions wipe coach advice states to prevent cheats.

---

## ⚖️ Referee Redesign (Mathematical Winners)

The AI Referee is split into two actions to ensure outcomes are deterministic and free of hallucination:

### 1. Exchange Scoring (`action: "score"`)
- Called in the background after the user submits an argument and the opponent rebuttal finishes streaming.
- Evaluates statements on **Evidence, Logic, Relevance, and Persuasion (0-10 scale)**.
- **Client Scoreboard State**:
  ```typescript
  const [runningScores, setRunningScores] = useState({
    sideA: { evidence: 0, logic: 0, relevance: 0, persuasion: 0 },
    sideB: { evidence: 0, logic: 0, relevance: 0, persuasion: 0 }
  });
  const [scoredExchangesCount, setScoredExchangesCount] = useState(0);
  ```

### 2. Winner Determination
- The winner is calculated mathematically by the client at the end of the match:
  ```typescript
  const totalA = runningScores.sideA.evidence + runningScores.sideA.logic + runningScores.sideA.relevance + runningScores.sideA.persuasion;
  const totalB = runningScores.sideB.evidence + runningScores.sideB.logic + runningScores.sideB.relevance + runningScores.sideB.persuasion;
  const winnerName = totalA >= totalB ? data.teamName : data.rival;
  ```

### 3. Verdict Explanation Compilation (`action: "explain"`)
- The client passes the calculated winner, accumulated scores, and short statement logs to `/api/agent/referee`.
- Prompt instructs the model to draft an explanation explaining:
  - Strongest and weakest arguments for both sides.
  - The match turning point.
  - Why the winner scored higher.
- Returns a clean JSON containing the final explanation text under 120 words.
