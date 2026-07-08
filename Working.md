# GOAT Arena gameplay & State Operations (Phase 3.9)

This document explains the input validation, deterministic lookup bypass, query-routing layer, strategic coach intent responses, opponent structured rebuttals, layout stability rules, side assignment audit, and response validations.

---

## 🖥️ Layout Stability & Viewport Height Lock

The application is structured to mimic an esports console dashboard, ensuring layout coordinates remain static across stages:
1. **Container Constraint**: The root viewport wrapper is set to exactly `h-screen max-h-screen overflow-hidden flex flex-col`.
2. **Scrolling Containment**: Global page scrolling is disabled. Scroll zones are isolated to internal panels:
   - Live debate feed transcript
   - Timeout coach Research assistant logs
   - Post-game overlay panels
   All panels use `overflow-y-auto min-h-0 flex-1 flex flex-col` CSS properties.

---

## 🛡️ Opponent Side Assignment Audit & Stance Card

To prevent the AI Opponent from praising or defending the user's side, we enforce strict client-side alignment and server-side checkpoints:
1. **Rival Metadata JSON Preloading**: The client resolves `opponentSideId` based on the selected clash type and preloads both `/data/${sideId}.json` and `/data/${opponentSideId}.json`.
2. **Dynamic Stance Binding**: The Left Column Stance Panel dynamically maps badge profiles, stance paragraphs (`getStanceDescription()`), and Key Rival Assets bullets directly from the loaded `opponentData` stats rather than hardcoding Messi vs Ronaldo.
3. **Strict Route Prompts**: The opponent endpoint is sent explicit guidelines:
   `You are defending TEAM {opponentSide}. Never support {userSide}. Never praise {userSide}. Always argue from the perspective of {opponentSide}.`
4. **Self-Validation Regeneration Loop**: On every rebuttal generation, the server checks the generated string for patterns of user-side praise or self-deprecation. If caught, it rejects and regenerates (up to 3 times) before falling back to a deterministic, high-scoring profile statement.
5. **Auditing Console Logs**: Console prints detail `userSide`, `opponentSide`, `loadedContextFile`, and `loadedEntity` before model generation.

---

## 🏆 Explainable Sports Analyst Referee Verdict

The final winner screen is structured as an esports analytics sheet divided into 7 zones:
- **SECTION 1: Winner Panel**: Winner Name, Final Scores.
- **SECTION 2: Turning Point**: Qualitative review of the match momentum pivot.
- **SECTION 3: Best User Argument**: Quote from user, category tag, score impact (e.g. `+9 Evidence, +7 Persuasion`).
- **SECTION 4: Best Opponent Argument**: Quote from opponent, category tag, score impact.
- **SECTION 5: Weakest User Argument**: Quote, reasoning for weakness.
- **SECTION 6: Weakest Opponent Argument**: Quote, reasoning for weakness.
- **SECTION 7: Score Breakdown**: Interactive visual progress bars matching qualitative category summaries for Evidence, Logic, Relevance, and Persuasion.
