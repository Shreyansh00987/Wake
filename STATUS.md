# Project Status

## Current Phase: P4 Complete -> Transitioning to P5 (Precomputed Samples, Docker & Deployment)

### Done (P4)
- Built complete Next.js 14 App Router API layer:
  - `POST /api/scan`: streaming Server-Sent Events (SSE) with path traversal security.
  - `GET /api/graveyard`: fetches current repository tombstone records and haunting counts.
  - `GET /api/headstone/[id]`: detailed inspection artifact with grounded obituaries.
  - `GET /api/hauntings`: repository ghost references.
  - `POST /api/exorcise/[id]`: generates copy-only unified diffs for purging dangling references.
  - `GET /api/status`: health and runtime monitor for local Ollama daemon.
- Created archival minimalist UI components via Impeccable:
  - `Timeline.tsx`: interactive D3.js timeline with 40ms staggered mark entrance and mobile vertical month list.
  - `HeadstoneSheet.tsx`: sliding inspection drawer with clickable SHA chips expanding verified commits, vital dates, and final diffs.
  - `GraveyardTable.tsx`: hairline rows with lift-on-hover (1px over 150ms) and tabular numerals.
  - `ExorciseModal.tsx`: unified diff viewer with one-click copy and read-only guarantee.
- Implemented core screens:
  - Landing / Necropolis (`src/app/page.tsx`): live-rendered with real historical data from Wake's own repo, offline terminal quickstart, and feature headstones.
  - Archaeological Scanner (`src/app/scan/page.tsx`): live SSE progress bar and scrolling event log.
  - Hauntings Ledger (`src/app/hauntings/page.tsx`): ghost inspector with Marigold accent badges and instant Exorcise diff generator.
- Verified offline typography with self-hosted IBM Plex Sans & IBM Plex Mono (`@fontsource`).
- Generated `DESIGN.md` and verified with `impeccable detect` (0 anti-pattern findings).
- Verified production build with `npm run build` (all 6 static and dynamic routes compiled successfully).

### Next (P5)
- Generate precomputed sample scans for the hosted demo in `samples/` (`samples/wake.json`, `samples/cors.json`).
- Write `Dockerfile` and `docker-compose.yml` for zero-friction one-command local execution.
- Create deployment configuration (Render / Docker setup) serving precomputed samples for static/read-only exploration.

### Risks & Mitigations
- **Hosted Cloud Inference:** Open-weight models require GPU/CPU resources that cloud free tiers cannot run; hosted demo is precomputed from real local runs, and the README/post explicitly and transparently states this.
