# Project Status

## Current Phase: P3 Complete -> Transitioning to P4 (UI & Web Application via Impeccable)

### Done (P3)
- Implemented cross-platform ripgrep wrapper in `src/lib/ghosts/ripgrep.ts` using `@vscode/ripgrep` bundled binary with strict child_process argument arrays.
- Built Haunting Detector in `src/lib/ghosts/hauntings.ts` to identify surviving references to dead files, import paths, and exported symbols.
- Added robust false-positive filters: ignores vendored packages (`node_modules`), lockfiles (`package-lock.json`, `yarn.lock`, etc.), build directories, requires token length >= 4 chars, filters generic language keywords, and ranks matches by confidence.
- Implemented Exorcise Diff Generator in `src/lib/ghosts/exorcise.ts` producing standard copy-only unified diffs (strictly read-only; zero mutation of user repositories).
- Created comprehensive unit test suite in `test/hauntings.test.ts` (100% pass across all 12 tests in the project).

### Next (P4)
- Build the Web Application and UI per the Impeccable design system specification:
  - Dark graphite ground `oklch(16% 0.01 260)`, crisp text `oklch(92% 0.01 260)`, ash-grey ramp for dead code.
  - ONE accent: Marigold `oklch(78% 0.15 75)` strictly and solely for "still haunting".
  - Hairline borders (1px), 2px corners, 4px spacing scale, IBM Plex Sans & IBM Plex Mono self-hosted fonts.
  - Landing Screen (live-rendered real graveyard of Wake's own repo, plain headline, hairline rows, offline instructions).
  - Scan Screen with Server-Sent Events (SSE) streaming progress (`POST /api/scan`).
  - Necropolis View with D3.js timeline visualization of deaths.
  - Headstone Drawer / Sheet with clickable SHA chips expanding verified commits.
  - Hauntings View with confidence ranking, code snippets, and Exorcise modal/diff viewer.
  - All states: empty state ("Nothing has died here yet."), error state (Ollama offline guide with copyable `ollama serve`), path traversal protections.
- Run `/impeccable document` to record design system in `DESIGN.md`.

### Risks & Mitigations
- **SSE Stream In Sandbox / Localhost:** SSE requires proper headers (`text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`). Test API route to ensure streaming chunks arrive seamlessly.
- **Font Hosting:** `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` imported in global CSS to guarantee 100% offline functionality.
