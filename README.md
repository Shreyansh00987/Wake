# Wake: "Every deleted line had a reason."

Wake scans a git repository, finds every deleted file, and writes a grounded obituary for each death. It then locates the "ghosts": living code, documentation, and configuration files that still reference things that died.

Deterministic git analysis produces 100% of the facts. A local open-weight model only narrates and classifies, and every claim must cite a real commit SHA from the death's verified context pack. If an LLM hallucination is detected, Wake immediately rejects it and falls back to a deterministic template obituary.

Built for the **DEV Hacktoberfest Open-Source AI Challenge: Week 4** (Theme: *Ghost in the Machine*).

---

## Core Capabilities

1. **Deterministic Git Ingestion:**
   Tracks deletions with rename detection (`git log -M --name-status`) so moved or renamed files are never falsely classified as deaths.
2. **Grounded Evidence Layer:**
   Stores birth commit SHA, death commit SHA, lifespan in days, last words (the final commit message), author attribution, and diff stat.
3. **Verified Obituaries:**
   Structured JSON narration and cause classification (`refactor`, `rewrite`, `abandoned_experiment`, `security_fix`, `dependency_removal`, `unknown`). Rejects any claim or hallucinated commit SHA not found in the verified commit history.
4. **The Necropolis (Graveyard Timeline):**
   An interactive D3-powered timeline and ledger of every file that died in the project.
5. **Headstone View:**
   Detailed inspection sheet showing birth, death, lifespan, last words, verified obituary, real diff, survivors, and interactive commit chips.
6. **Haunting Detector:**
   Ripgrep search across active code, markdown docs, and config to detect zombie references to deleted files and symbols, with confidence ranking and noise filtering.
7. **Exorcise (Diff Generator):**
   Generates a clean unified diff to purge dead references. **Read-only by design:** Wake never modifies your source files without your review.

---

## Architecture & AI Distinctions

Wake operates under a strict principle of **Honest AI**:
- **Open-Source Software (OSS):**
  - [Ollama](https://github.com/ollama/ollama) (MIT License) - Local model runtime and serving engine.
  - [SQLite](https://sqlite.org/) (Public Domain) - Embedded zero-config database.
  - [ripgrep](https://github.com/BurntSushi/ripgrep) (MIT / UNLICENSE) - Ultra-fast regex search.
  - [Next.js](https://nextjs.org/) (MIT License) - Web framework and React runtime.
  - [D3.js](https://d3js.org/) (ISC License) - Timeline visualization math and scales.
- **Open-Weight Models:**
  - **Default:** `gemma3:1b` (Size: 806 MB, Parameters: 999.89M, Quantization: Q4_K_M).
    - **License:** [Gemma Terms of Use](https://ai.google.dev/gemma/terms) (February 21, 2024). Open-weight commercial release with acceptable use terms.
  - **Fallback:** `qwen2.5-coder:1.5b` (Size: ~980 MB, License: Apache 2.0). Selectable via `WAKE_MODEL=qwen2.5-coder:1.5b`.
- **Zero Proprietary API Calls:** Runs 100% offline. Zero external network telemetry at runtime. $0 operational cost.

---

## Quick Start

### Prerequisites
- Node.js >= 20.x
- Git >= 2.30
- [Ollama](https://ollama.com/) running locally:
  ```bash
  ollama serve
  ollama pull gemma3:1b
  ```

### Local Setup
```bash
# Clone the repository
git clone https://github.com/Shreyansh00987/Wake.git
cd Wake

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Configuration

Copy `.env.example` to `.env.local`:
```env
# Port & Host
PORT=3000

# Ollama Model Configuration
OLLAMA_HOST=http://127.0.0.1:11434
WAKE_MODEL=gemma3:1b

# Optional Sentry Monitoring (Metadata only: latency, tokens, error counts - never code content)
# SENTRY_DSN=
```

---

## Limitations & Honest Notes

- **Language Parsing:** Ripgrep-based haunting detection uses token boundary heuristics. While fast and effective across markdown, JSON, configs, and source files, short generic identifiers (e.g., `id`, `data`, `index`) can produce false positives if not filtered by minimum token length (>= 4 characters) or path context.
- **Large Repositories:** For monorepos or repositories with tens of thousands of commits, scans are capped to the most significant $N$ deaths to prevent memory exhaustion and respect local inference speeds.
- **Offline Fonts:** All UI fonts (`IBM Plex Sans` and `IBM Plex Mono`) are self-hosted via `@fontsource` packages; no Google Fonts requests are made at runtime.

---

## Post-Deadline Commits

Any commits made after October 31, 2026 11:59 PM IST will be transparently documented in this section:
*None yet. All initial commits occurred during the active Hacktoberfest challenge window.*

---

## Credits & Attribution

- **Challenge:** Built for [DEV Hacktoberfest Open-Source AI Challenge Week 4](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).
- **Design Philosophy:** Inspired by archival minimalism and designed using [Impeccable](https://impeccable.style).
- **Model Weights:** Google Gemma team for `gemma3:1b` weights.
