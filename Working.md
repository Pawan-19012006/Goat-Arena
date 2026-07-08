# GOAT Arena gameplay & State Operations (Phase 3.9)

This document explains the input validation, deterministic lookup bypass, query-routing layer, strategic coach intent responses, opponent structured rebuttals, layout stability rules, side assignment audit, response validations, and advocate personality rules.

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

## 🛡️ Opponent Side Assignment Audit & Advocate Personality

To prevent the AI Opponent from praising or defending the user's side, we enforce strict client-side alignment and server-side checkpoints:
1. **Rival Metadata JSON Preloading**: The client resolves `opponentSideId` based on the selected clash type and preloads both user and rival JSON files.
2. **Dynamic Stance Binding**: Stance badges, current stance descriptions, and Key Rival Assets statistics bind dynamically from the loaded `opponentData` stats rather than hardcoding Messi vs Ronaldo.
3. **Advocate Tone Prompts**: System prompts adopt the traits: `Confident`, `Competitive`, `Relentless`, `Persuasive`, and `Unshakable`. The opponent is instructed to act as a pure advocate who genuinely believes its side is superior.
4. **Challenge ➔ Counter-Evidence ➔ Closing Strategy**: Rebuttals follow a three-part structure:
   - **CHALLENGE**: Challenge the user's statement directly and confidently (no acknowledging or agreeing).
   - **COUNTER EVIDENCE**: State a strong statistic or fact from the retrieved context.
   - **CLOSING STATEMENT**: Deliver a sharp, competitive closing statement locking in the stance.
5. **Soft-Concession Filters & Validation**: Expanded the server's validation check to block concession starters (e.g. `"that's true"`, `"i agree"`, `"you are correct"`, `"to be fair"`, `"admittedly"`, `"indeed impressive"`). If caught, it rejects and regenerates (up to 3 times) before loading a safe default fallback profile statement.

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
