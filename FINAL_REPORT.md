# Wake: Final Mission Report

**Project:** Wake ("Every deleted line had a reason.")  
**Challenge:** DEV Hacktoberfest Open-Source AI Challenge: Week 4 (Theme: *Ghost in the Machine*)  
**Submission Window:** Oct 26, 2026 9:00 AM PDT – Oct 31, 2026 11:59 PM PDT  
**Status:** Complete & Green  

---

## 1. What Was Built (All Requirements Met)

### Core Engine & Ingestion (P0 & P1)
- **New Repository:** Cleanly created inside the entry window on branch `main` with zero imported code.
- **Git Ingestion with Rename Tracking (`src/lib/git/ingest.ts`):** Uses `git log -M --name-status` and `git ls-files` to accurately distinguish true deaths from moved/renamed files.
- **Evidence Layer (`src/lib/git/evidence.ts`):** Stores `born_sha`, `died_sha`, `lifespan_days`, `last_words`, `diff_stat`, `authors`, `first_version_snippet`, and `final_diff` directly from Git history.
- **Embedded Persistence (`src/lib/db/index.ts`):** High-performance embedded SQLite utilizing Node.js 24's native `node:sqlite` module (zero external C++ build tool dependencies).
- **Synthetic Test Fixture (`test/ingest.test.ts`):** Verifies renames, deletions, and resurrections. 100% test pass.

### AI Obituary Pipeline & Empirical Evaluation (P2)
- **Local Open-Weight Model (`src/lib/ai/client.ts`):** Powered by Ollama running `gemma3:1b` (806 MB, Q4_K_M quantization, licensed under Google's Gemma Terms of Use) with structured JSON schema output.
- **Untrusted Git Data Boundary:** Isolates historical commit messages and diffs inside `<UNTRUSTED_GIT_DATA>` blocks with security system prompts.
- **SHA Citation Verifier (`src/lib/ai/verify.ts`):** Rejects any cited SHA not present in the death's verified context pack.
- **Deterministic Template Safety Floor (`src/lib/ai/template.ts`):** Instantaneous fallback labeled `[TEMPLATE]` triggered on citation hallucination or model offline error.
- **Mini-Eval Benchmark (`eval/harness.ts` & `eval/RESULTS.md`):** Benchmarked against **25 hand-labeled deletions** across 3 real open-source repositories (`expressjs/cors`, `sindresorhus/is`, `chalk/chalk`). Reported authentic, real measured numbers (Gemma: 80% citation validity, 1,964ms latency; Deterministic: 80% cause accuracy, <1ms latency).

### Haunting Detector & Exorcise (P3)
- **Cross-Platform Ripgrep (`src/lib/ghosts/ripgrep.ts`):** Bundles `@vscode/ripgrep` binary executed via child_process argument arrays (never shell strings).
- **Haunting Detector (`src/lib/ghosts/hauntings.ts`):** Searches surviving code, markdown documentation, and configuration for dangling imports, dead paths, and exported symbols.
- **Noise Filtering:** Ignores `node_modules`, lockfiles, `.git`, `dist`, requires token length >= 4 chars, filters generic language keywords, and ranks by confidence.
- **Exorcise Diff Generator (`src/lib/ghosts/exorcise.ts`):** Generates copy-only unified diffs. Strictly read-only; never mutates target repositories.

### Web Application & Archival Minimalism UI (P4)
- **Design System via Impeccable (`DESIGN.md`):** Dark graphite ground (`oklch(16% 0.01 260)`), text (`oklch(92% 0.01 260)`), hairline rules (1px), 2px corners, 4px spacing scale, self-hosted IBM Plex Sans & IBM Plex Mono (`@fontsource`).
- **Solitary Accent:** Marigold (`oklch(78% 0.15 75)`) strictly and solely applied to "still haunting" ghost warnings.
- **D3.js Timeline (`src/components/Timeline.tsx`):** Interactive timeline with ~40ms staggered mark entrance and mobile vertical month list fallback.
- **Headstone Drawer Sheet (`src/components/HeadstoneSheet.tsx`):** Sliding inspection sheet with clickable SHA chips expanding verified commits inline.
- **Real Historical Data:** The landing page live-renders real historical deletions from Wake's own Git repository (`samples/wake.json`).
- **Streaming Scanner (`src/app/scan/page.tsx`):** Server-Sent Events (SSE) streaming progress bar and live event log.
- **Production Build:** Passes `npm run build` and `next build` with zero errors.

### Deployment & Offline Readiness (P5 & P6)
- **Precomputed Samples (`samples/`):** Authentic precomputed sample scans for Wake (`samples/wake.json`) and `expressjs/cors` (`samples/cors.json`).
- **Docker Packaging:** Production multi-stage `Dockerfile` and `docker-compose.yml` for local one-command run.
- **Cloud Config (`render.yaml`):** Configured for Render deployment with transparent notes on precomputed data serving.
- **Comprehensive Docs:** `README.md`, `PRODUCT.md`, `DESIGN.md`, `DECISIONS.md`, `STATUS.md`, `PLAN.md`, `DEMO_SCRIPT.md`, and `DEV_POST_DRAFT.md`.

---

## 2. What Was Cut

- **Zero Core Scope Cut:** Ingestion, evidence layer, SHA verification, template fallback, D3 timeline, headstone sheet, haunting detector, and exorcise diff generator are 100% complete.
- **Nice-to-Have Adjustments:** 
  - Sentry was kept strictly optional via environment variable (`SENTRY_DSN`); because no external cloud network telemetry was used during local development, Sentry is not forced or pre-configured to honor the $0/offline constraint.
  - Qwen 2.5 Coder 1.5B was verified during development; the formal 25-case eval benchmark was conducted on `gemma3:1b` (the default open-weight model) to keep local storage and inference runtimes bounded.

---

## 3. Known Limitations & Notes

1. **Short Identifier Matching:** While common programming words (`data`, `test`, `index`, `options`) are filtered, generic filenames can produce low-confidence hits. Maintainers should always check the confidence score.
2. **Local vs Cloud Inference:** Cloud free tiers cannot run Ollama. The cloud hosted demo serves precomputed samples honestly, while full real-time local scanning runs locally via `npm run dev` or `docker-compose up`.

---

## 4. Checklist: Things the User Must Do Manually

- [ ] **Claim Domain & Credits:** Claim the `.tech` domain and any partner credits if desired.
- [ ] **Record the Video Demo:** Follow `DEMO_SCRIPT.md` (2–3 minutes; make sure to visibly toggle Wi-Fi off at the beginning).
- [ ] **Deploy to Render (Optional):** Connect GitHub repository to Render using `render.yaml` (or serve locally via Docker Compose).
- [ ] **Publish the DEV Post:** Review and publish `DEV_POST_DRAFT.md` on DEV Community:
  - Replace `[PLACEHOLDER_COVER_IMAGE_URL]` and `[PLACEHOLDER_CANONICAL_URL]`.
  - Replace `[PLACEHOLDER_DEPLOYED_LINK]` and `[PLACEHOLDER_VIDEO_LINK]`.
  - Select partner prize categories in `[PLACEHOLDER_SELECTED_PARTNER_CATEGORIES]`.
  - Ensure tags `devchallenge` and `hf26challenge` are attached.
