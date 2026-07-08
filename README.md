# ⚽ GOAT ARENA

### *The Ultimate AI-Powered Football Fan Fight Arena*

**Can you out-argue an AI that never backs down?**

---

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![QVAC](https://img.shields.io/badge/QVAC-Local%20AI-8B5CF6?style=for-the-badge)](https://qvac.dev)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)
[![Hackathon](https://img.shields.io/badge/QVAC%20×%20Tether-Hackathon%202026-F59E0B?style=for-the-badge)](https://tether.to)

---

> **GOAT Arena** is a local-first AI debate arena where football fans step into the battlefield and defend their football legends — Messi, Ronaldo, Mbappé, Haaland, Argentina, Brazil — against a relentless AI rival powered entirely on-device by QVAC. No cloud. No API keys. No compromise.

---

## 📽️ Demo Video

[![GOAT Arena Hackathon Demo Video](https://img.shields.io/badge/YouTube-Play%20Demo%20Video-red?style=for-the-badge&logo=youtube&logoColor=white)](#)  
*(Replace with your YouTube URL link during the submission submission)*

---

## 📸 Screen Showcases

| Arena Locker Selection | Live Debate Pitch |
| :---: | :---: |
| ![Arena Locker Selection](docs/screenshots/select_mock.png) | ![Live Debate Pitch](docs/screenshots/debate_mock.png) |
| *Equip yourself with stats from the local fact locker.* | *Duel with the Rival Legend in real-time.* |

| Strategic Timeout | Final Referee Verdict Sheet |
| :---: | :---: |
| ![Strategic Timeout](docs/screenshots/timeout_mock.png) | ![Final Referee Verdict Sheet](docs/screenshots/verdict_mock.png) |
| *Formulate counterattacks privately with Coach Finch.* | *Analyze the quantitative performance breakdown.* |

---

## 🌟 Project Vision: The Football Fan Battlefield

This is **not** an academic debate application. This is a high-intensity football fan fight arena where supporters enter the coliseum to defend their football legends against intelligent AI rivals who refuse to yield. 

In group chats, pub corners, and social media comments, football fans wage relentless wars over legacies:
- **Messi**'s playmaking wizardry vs **Ronaldo**'s athletic dominance.
- **Mbappé**'s explosive pace vs **Haaland**'s clinical goal-scoring numbers.
- **Brazil**'s 5 World Cup stars vs **Argentina**'s reigning global titles.

But social media threads end in noise. **GOAT Arena** converts this tribal energy into an intelligent, gamified multi-agent system. It challenges the user: **Can you out-argue a local AI that never backs down?**

---

## 🧠 QVAC Engine: Fully On-Device Multi-Agent Intelligence

Every rebuttal, coaching suggestion, and referee decision is computed **entirely on-device** using the **QVAC Runtime**. 

### Why QVAC & Local-First AI Matter

- 🔒 **Absolute Privacy**: User arguments and fan banter are processed locally. No data leaves the machine.
- 📴 **100% Offline Capability**: Play on a flight, in a subway, or during stadium network congestion. No internet connection required post-installation.
- ⚡ **Minimal Latency**: Instant model response streaming without cloud routing queues or network overhead.
- 💰 **Zero Cloud API Costs**: No reliance on OpenAI, Anthropic, or external API endpoints. Runs for free, forever.
- 🛠️ **User Ownership**: Your intelligence sandbox remains completely under your local environment.

### Multi-Agent Orchestration via QVAC

QVAC enables a local multi-agent setup running a lightweight **1-Billion Parameter Instruct Model** on ordinary laptop hardware:

1. **Rival Legend (Opponent Agent)**: Uses section-routed context to craft unyielding counters. Employs a validation retry loop to catch self-deprecation or side-switching phrases (e.g. *"that's true"*, *"I agree"*), forcing regeneration up to 3 times before fallback execution.
2. **Coach Finch (Strategic Assistant)**: Classifies user requests into 7 distinct intents (FACT, HISTORY, ACHIEVEMENT, SUPPORT_POINTS, etc.) to target precise context sections instead of overloading the context window.
3. **Arena Referee (Judge Agent)**: Uses a 2-step process. First, scores the argument exchange mathematically. Second, synthesizes a 7-section structured JSON analysis showing the turning point and argument quality.

---

## 🏟️ Game Modes & Arenas

### 🐐 Messi vs Ronaldo
The ultimate debate. The playmaker with 8 Ballon d'Ors and the 2022 World Cup vs the clinical machine with 5 UCL titles and the all-time international scoring record.

### ⚡ Mbappé vs Haaland
The new era. The French sensation with a World Cup final hat-trick vs the Norwegian cyborg who broke the Premier League scoring record in his debut season.

### 🌎 Argentina vs Brazil
The classic South American Superclásico. *La Albiceleste* (3 World Cups, 16 Copa Américas) vs *Seleção* (5 World Cups, the home of Jogo Bonito).

---

## 🧬 Component Details & Agent Roles

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              RIVAL LEGEND                               │
│  Main Opponent • Relentless Advocate • Confident & Competitive Stance    │
│  Strategy: CHALLENGE ➔ COUNTER-EVIDENCE ➔ CLOSING STATEMENT             │
│  Enforces: Concession blocking & side-switching validations             │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │  Debates
                                   ▼
┌─────────────────────────┐               ┌───────────────────────────────┐
│        USER FAN         │ ◄───────────► │          COACH FINCH          │
│  Equips facts in locker │   Timeouts    │  Private Analyst Assistant    │
│  Submits key arguments  │               │  Routes queries by 7 intents  │
└─────────────────────────┘               └───────────────────────────────┘
                                   │
                                   │  Evaluates
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              ARENA REFEREE                              │
│  Neutral Judge • Accumulates round scores mathematically (0-10)          │
│  Evaluates: Evidence, Logic, Relevance, Persuasion                      │
│  Verdict: Renders 7-section post-match analytics verdict                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture & Retrieval Layer

```mermaid
graph TD
  User[👤 User / Football Fan] -->|Enters Arena & Submits Arguments| UI[🖥️ Next.js Arena HUD: 100vh Lock]
  
  subgraph Client App
    UI -->|Loads sideId & opponentSideId JSONs| DataHooks[Dual Data Hooks: data & opponentData]
    DataHooks -->|Dynamic Binding| StanceCards[Left Column: Stats, Description]
  end

  subgraph Local API Gateways
    UI -->|Debate Feed State| OpponentAPI[/api/agent/opponent]
    UI -->|Timeout Console Input| CoachAPI[/api/agent/coach]
    UI -->|Trigger Final Judgement| RefereeAPI[/api/agent/referee]
  end

  subgraph Intelligence Routing & Grounding
    OpponentAPI -->|Retrieves context based on argument topics| Retrieval[Section-Routed Context Retrieval]
    CoachAPI -->|Classifies query into 7 intents| IntentClassifier[Intent Classifier Layer]
    IntentClassifier -->|Loads targeted section only| Retrieval
    
    MarkdownLocker[(Local Markdown Locker:\nmessi.md, ronaldo.md, mbappe.md,\nhaaland.md, argentina.md, brazil.md)]
    Retrieval -->|Reads specific headers e.g. # Achievements| MarkdownLocker
  end

  subgraph On-Device AI Sandbox
    OpponentAPI -->|Constructs grounded prompt| QVAC[🟣 QVAC Local Runtime]
    CoachAPI -->|Bypasses LLM for common queries or queries QVAC| QVAC
    RefereeAPI -->|Determines winner mathematically & explains via JSON| QVAC
    QVAC -->|Streams tokens back| UI
  end
```

### Architecture Specifications

1. **Targeted Section Retrieval**: Instead of loading whole document files, the retrieval engine parses specific headers (`# Records`, `# Weaknesses`, `# Counter Points`). This limits prompt size and speeds up local token generation.
2. **Esports Viewport Isolation**: The UI sets the root container to `h-screen max-h-screen overflow-hidden`. The main debate thread, coach terminal, and final verdict pages use isolated internal scrolling to prevent layout shifts during generation.
3. **Deterministic Factual Bypass**: Coach Finch intercepts standard factual questions (e.g. *“what is Messi's age?”*, *“how many goals has Ronaldo scored?”*) and matches them against a lookup table, returning answers without model inference.

---

## 🛠️ Technical Implementation

- **Framework**: [Next.js 15.5](https://nextjs.org) (App Router, Server API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org) (Enforces clean data structures)
- **Styling**: [TailwindCSS 4.0](https://tailwindcss.com) (Esports dark theme, glow accents, glassmorphic layout)
- **Animation**: [Framer Motion 12](https://www.framer.com/motion/) (Smooth timeout drawer slide-ins, dynamic momentum dials)
- **Local AI Layer**: [QVAC SDK](https://qvac.dev) (Local model loading, memory unloading, structured JSON generation, token streaming)
- **Storage/Data**: Markdown text files for grounding + Static JSON files for UI properties.

---

## 🚀 Setup & Installation Guide

Judges and developers can run GOAT Arena completely locally using these steps:

### 1. Requirements
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)
* **QVAC SDK runtime** installed on the local developer machine
* A QVAC-compatible **1B Parameter Instruct Model** (loaded in the background)
* Minimum **4GB RAM** (8GB+ recommended for swift local inference)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/pawaneswaran/goat-arena.git
cd goat-arena

# Install project dependencies
npm install
```

### 3. Model Configuration
Ensure your local environment exposes QVAC endpoints correctly. Create a `.env.local` file in the project root:
```env
# The target QVAC local model identifier
QVAC_MODEL_ID=your-model-id-here

# Enable debug mode on-screen telemetry details
NEXT_PUBLIC_DEBUG_MODE=true
```
*Note: The model control handler (`src/app/api/model/control/route.ts`) will attempt to download and load the model on first Arena entry.*

### 4. Running the Dev Server
```bash
# Launch the dev server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

**What to expect on first run:**
1. Select your rivalry and lock in your side.
2. In the deployment phase, click **ARM FACT** on the facts you want to bring into the match.
3. Click **LOCK IN ARSENAL & START MATCH**. The app will load the local model.
4. Telemetry details in debug mode will display local latencies, character lengths, and query categories.

---

## 📐 Reproducibility & Limitations

### Reproducibility
GOAT Arena runs model inference **locally** on your hardware. Because text generation is probabilistic:
- Rebuttal phrasing and coach advice outputs naturally vary between runs.
- **Deterministic lookup** guarantees that factual metrics (e.g. Ballon d'Or count, country representation, goals) remain exactly consistent.
- The scoring calculations are handled mathematically, maintaining identical match outcomes for equivalent debate scores regardless of model variation.

### Limitations
- **Model Parameter Constraints**: Running a 1B instruct model locally requires simple, direct instructions. The model might occasionally repeat semantic phrases or sound slightly formulaic.
- **Hardware Performance**: Response generation speed correlates with processor capability. Older machines might experience longer latency before token streaming begins.
- *“Given the constraints of fully local AI inference, GOAT Arena demonstrates what is already possible today using QVAC-powered on-device intelligence.”*

---

## 🗺️ Future Roadmap (Phase 2 & Beyond)

- 🏆 **Championship Tournament Mode**: Face multiple Rival Legends in a tournament tree format to win virtual cups.
- 🎙️ **Voice Debate Stream**: Speak your arguments directly using local Whisper speech-to-text models.
- ⚡ **Larger Model Scaling**: Support 3B and 7B local parameter models as on-device hardware engines improve.
- 🏟️ **Dynamic Crowd Reaction Audio**: Real-time ambient crowd sound effects that cheer or boo based on the referee's round score.
- 🌎 **More Legends & Nations**: Add Pelé vs Maradona, Zidane vs Iniesta, Premier League vs La Liga.
- 🤝 **Multiplayer Fan Showdowns**: Local hot-seat or local network multiplayer battles judged by the referee.

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

*Created for the QVAC × Tether Hackathon 2026.*
