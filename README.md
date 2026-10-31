# Wake: "Every deleted line had a reason."

[![DEV Submission](https://img.shields.io/badge/DEV%20Submission-Ghost%20in%20the%20Machine-0A0A0A?style=flat-square&logo=devdotto&logoColor=white)](https://dev.to/shreyansh_agrahari_2009db/wake-every-deleted-line-had-a-reason-an-archival-git-necropolis-510o)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://wake-necropolis.onrender.com)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-1%3A12%20Full%20HD-E50914?style=flat-square&logo=mp4&logoColor=white)](wake_demo_walkthrough.mp4)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Shreyansh00987%2FWake-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Shreyansh00987/Wake)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Official DEV Challenge Submission:** [https://dev.to/shreyansh_agrahari_2009db/wake-every-deleted-line-had-a-reason-an-archival-git-necropolis-510o](https://dev.to/shreyansh_agrahari_2009db/wake-every-deleted-line-had-a-reason-an-archival-git-necropolis-510o)  
> **Hosted Interactive Necropolis:** [https://wake-necropolis.onrender.com](https://wake-necropolis.onrender.com)  
> **Demo Walkthrough Video (1:12):** [wake_demo_walkthrough.mp4](wake_demo_walkthrough.mp4) *(1080p Full HD with AI voiceover).*  
> *(Note: Hosted demo serves authentic precomputed real scans from `samples/wake.json` and `samples/cors.json` since free cloud containers lack local Ollama/GPU runtimes. For live local scans, run via `docker-compose up` or `npm run dev`).*

Wake scans any Git repository, identifies every deleted file, and writes a grounded obituary for each death. It then locates the "ghosts": living code, documentation, and configuration files that still reference things that died.

Deterministic Git analysis produces 100% of the facts. A local open-weight model only narrates and classifies, and every claim must cite a real commit SHA from the death's verified context pack. If a hallucinated commit SHA is detected, Wake immediately rejects it and falls back to a deterministic template obituary labeled `[TEMPLATE]` in the UI.

Built from scratch for the **DEV Hacktoberfest Open-Source AI Challenge: Week 4** (Theme: *Ghost in the Machine*).

---

## Key Features

1. **Deterministic Git Ingestion with Rename Tracking (`git log -M`):**
   Traces file deletions accurately. Moved or renamed files (`git log -M --name-status`) are tracked through their lineage and are **never** counted as deaths.
2. **Grounded Evidence Layer:**
   Extracts birth commit SHA, death commit SHA, lifespan in days, last words (final commit message), author attribution, and diff stat directly from Git.
3. **Verified Obituaries & Citation Validation:**
   Structured JSON narration and cause classification (`refactor`, `rewrite`, `abandoned_experiment`, `security_fix`, `dependency_removal`, `unknown`). Rejects any claim or hallucinated commit SHA not present in the verified commit history.
4. **The Necropolis (Timeline & Ledger):**
   An interactive D3.js timeline with staggered mark entrance (~40ms per commit) and hairline rows. On mobile devices, the timeline becomes a vertical month list.
5. **Headstone Inspection Sheet:**
   Sliding right-hand sheet showing birth/death timestamps in tabular numerals, verified obituaries with clickable SHA chips (which expand inline to show the real commit message, author, and date), final deletion diffs, and surviving ghost references.
6. **Haunting Detector:**
   Ripgrep search across surviving code, markdown docs, and config to detect zombie references to deleted files and symbols. Features false-positive noise reduction (ignoring `node_modules`, lockfiles, `.git`, `dist`, filtering generic keywords, requiring >= 4 characters, and ranking by confidence).
7. **Exorcise (Copy-Only Unified Diff Generator):**
   Generates a standard unified diff to purge dead references. **Strictly read-only:** Wake never modifies your source files without your review.

---

## Architecture & Honest AI Distinctions

Wake operates under a strict principle of **Honest AI**, distinguishing between open-source software and open-weight models:

- **Open-Source Software (OSS):**
  - [Ollama](https://github.com/ollama/ollama) (MIT License) - Local model runtime and serving daemon.
  - [Node.js `node:sqlite`](https://nodejs.org/api/sqlite.html) (Node.js MIT, SQLite Public Domain) - Embedded zero-dependency native database.
  - [ripgrep](https://github.com/BurntSushi/ripgrep) / [@vscode/ripgrep](https://www.npmjs.com/package/@vscode/ripgrep) (MIT / UNLICENSE) - Regex search engine with child_process argument arrays (zero shell interpolation).
  - [Next.js](https://nextjs.org/) (MIT License) - Web framework and React runtime.
  - [D3.js](https://d3js.org/) (ISC License) - Timeline visualization scales.
  - [IBM Plex Sans & Mono](https://github.com/IBM/plex) (SIL Open Font License 1.1) - Self-hosted via `@fontsource` for 100% offline capability.
- **Open-Weight Models:**
  - **Default Model:** `gemma3:1b` (Tag: `gemma3:1b`, Parameter Count: 999.89M, Quantization: Q4_K_M, Size: 806 MB).
    - **License:** [Gemma Terms of Use](https://ai.google.dev/gemma/terms) (Last modified: February 21, 2024). Open-weight commercial release with attribution and acceptable use policy.
  - **Fallback Model:** `qwen2.5-coder:1.5b` (License: Apache 2.0). Selectable via `WAKE_MODEL=qwen2.5-coder:1.5b`.
- **Zero Proprietary API Calls:** Wake requires no OpenAI, Anthropic, or external API keys. It runs 100% offline with $0 API spend.

---

## Quick Start

### 1. Prerequisites
- Node.js >= 20.x (Node 22 or 24 recommended for built-in `node:sqlite`)
- Git >= 2.30
- [Ollama](https://ollama.com/) running locally:
  ```bash
  ollama serve
  ollama pull gemma3:1b
  ```

### 2. Local Installation & Development
```bash
# Clone the repository
git clone https://github.com/Shreyansh00987/Wake.git
cd Wake

# Install dependencies
npm install

# (Optional) Seed SQLite database with Wake's own real git deletion history
npx tsx scripts/seed_wake.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. One-Command Local Run via Docker Compose
```bash
# Start Wake container connected to your host's local Ollama instance
docker-compose up --build
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:
```env
# Server Port
PORT=3000

# Local Ollama Inference Host
OLLAMA_HOST=http://127.0.0.1:11434

# Open-Weight Model Tag
WAKE_MODEL=gemma3:1b

# Maximum deaths to process per scan to cap memory on large repos
MAX_DEATHS_CAP=50

# Optional Sentry Monitoring (Metadata only: latency, tokens, error counts - never code content)
# SENTRY_DSN=
```

---

## Empirical Benchmark & Evaluation

Wake includes an evaluation harness (`eval/harness.ts`) tested against **25 hand-labeled historical deletions** across three open-source repositories (`expressjs/cors`, `sindresorhus/is`, `chalk/chalk`).

Detailed real measurements from `eval/RESULTS.md`:

| System / Model | Cases | Citation Validity Rate | Cause Accuracy | Avg Latency | Fallbacks |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Deterministic Template Engine** | 25 | **100.0%** (25/25) | **80.0%** (20/25) | < 1ms | 0 |
| **gemma3:1b (Open-Weight)** | 25 | **80.0%** (20/25) | **28.0%** (7/25) | 1964ms | 5 |
| **qwen2.5-coder:1.5b** | 25 | *Not run* | *Not run* | *N/A* | *N/A* |

*Note on Qwen:* `qwen2.5-coder:1.5b` was tested during prototyping. To keep local evaluation runs and disk storage bounded on consumer hardware, the formal benchmark reports real measured numbers for `gemma3:1b` (the primary default model) versus the deterministic baseline.

---

## Limitations & Honest False-Positive Notes

1. **Ripgrep Token Matching:** While Wake filters out lockfiles, `node_modules`, build artifacts, and generic programming keywords (`data`, `index`, `test`, `options`), short or generic file names (e.g. `constants.ts` or `env.js`) can occasionally match unrelated surviving comments. Wake displays match confidence percentages and grounded match reasons to help maintainers assess each hit.
2. **Hosted Demo Note:** The hosted cloud demo serves authentic precomputed sample scans (`samples/wake.json` and `samples/cors.json`). Cloud free-tier containers lack the GPU/CPU hardware to run Ollama locally. Real-time scanning with local open-weight inference is designed for local machine execution via `npm run dev` or `docker-compose`.
3. **Read-Only Guarantee:** Wake never writes to scanned repositories. The "Exorcise" button provides a standard unified diff that maintainers can inspect and apply manually with `git apply`.

---

## Post-Deadline Commits

Any commits pushed after the contest deadline (October 31, 2026, 11:59 PM IST) will be transparently documented in this section:
*None. All code, tests, and documentation were completed and committed inside the active Hacktoberfest challenge window.*

---

## Credits & Attribution

- Built for the [DEV Hacktoberfest Open-Source AI Challenge: Week 4](https://dev.to/challenges/hacktoberfest-week4-2026-10-26) (Theme: *Ghost in the Machine*).
- Design system inspired by archival minimalism and built using [Impeccable](https://impeccable.style).
- Model weights: Google Gemma team for `gemma3:1b`.
- Demo repositories: `expressjs/cors` (MIT), `sindresorhus/is` (MIT), `chalk/chalk` (MIT).
