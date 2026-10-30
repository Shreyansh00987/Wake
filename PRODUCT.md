# PRODUCT.md: Wake

## Register & Mode
- **Register:** Product
- **Mode:** Read & Experience (Maintainers inspecting codebase archeology; visitors reading grounded obituaries)

## Users & Situations
- **Core Users:**
  1. *Maintainers & Tech Leads:* Investigating why legacy components or subsystems were deleted, discovering dangling ghosts/stale imports across docs and active code, and generating clean exorcism diffs.
  2. *New Contributors:* Exploring architectural history and past decisions ("Every deleted line had a reason") without having to excavate thousands of untangled git log commits manually.

## Purpose & Core Job
Wake scans a git repository, deterministically extracts every deleted file (with full birth, death, author attribution, and rename-tracking evidence), and writes a grounded obituary for each deletion using a local open-weight model (Gemma 3 1B). It then tracks "ghosts": living code, docs, and configs that still reference dead files or symbols.

## Guiding Principles
1. **Calm & Archival:** Utilitarian, understated, and respectful of engineering history. Hairline precision, no superfluous decorative noise, zero gratuitous animations.
2. **Evidence-First:** Deterministic git analysis produces 100% of the facts. The open-weight model only narrates and classifies; it cannot invent facts.
3. **Never Hide Where a Claim Comes From:** Every claim must cite a real commit SHA from the death's verified context pack. Any uncited or hallucinatory SHA is strictly rejected.
4. **Local & Zero-Cost ($0):** Completely offline-capable, runs on consumer hardware via Ollama, zero telemetry, no proprietary AI APIs.
5. **Read-Only & Safe:** Wake never mutates the scanned repository. The "Exorcise" feature produces copyable unified diffs only.

## Stack & Architecture
- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS)
- **Data Persistence:** SQLite (embedded, local-first)
- **Timeline & Visualizations:** D3.js timeline + hairline layout
- **Search & Inspection:** Native git (`git log -M`, `git diff`, `git show`) and ripgrep child processes with strict argument arrays (zero shell interpolation)
- **Local AI:** Ollama (`gemma3:1b` default, Gemma Terms of Use; `qwen2.5-coder` fallback) with structured JSON schema output
- **Typography:** Self-hosted `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` (fully offline)

## Boundaries & Constraints
- Read-only analysis on scanned repositories.
- Untrusted git data boundary: all commit messages, diffs, and code are sanitized and isolated in prompt payloads.
- Fail-safe fallback: when Ollama is unavailable or rejects output, Wake renders a deterministic "template" obituary with full evidence.
