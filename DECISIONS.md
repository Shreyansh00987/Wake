# Architectural & Design Decisions

### D01: Contest Rules & Timeline Verification
- **Decision:** Align project strictly with Hacktoberfest 2026 Week 4 DEV Challenge ("Ghost in the Machine").
- **Verification:** Verified official pages (`dev.to/challenges/hacktoberfest-week4-2026-10-26` and rules page). Verified that the contest period is Oct 26, 2026 9:00 AM PDT to Oct 31, 2026 11:59 PM PDT. Internal deadline set to Oct 31, 2026 11:59 PM IST.
- **Conflict Assessment:** No conflicts between official rules and project requirements.

### D02: Open-Weight Model Selection
- **Decision:** Default to `gemma3:1b` (806 MB, Q4_K_M).
- **Verification:** Inspected local Ollama installation via `ollama show gemma3:1b`. Parameter count: 999.89M. License: Gemma Terms of Use (Last modified February 21, 2024, ai.google.dev/gemma/terms).
- **Fallback:** `qwen2.5-coder:1.5b` (or 0.5b) selectable via `WAKE_MODEL` environment variable.

### D03: Search & Inspection Tooling
- **Decision:** Use native `git` CLI (with `-M` rename detection) and ripgrep child processes with array arguments (`spawn(cmd, args)`), never shell-interpolated strings.
- **Cross-Platform Ripgrep:** Bundle `@vscode/ripgrep` to ensure `rg.exe` / `rg` binary is always present without requiring external host installations, with graceful fallback to system `rg` and `git grep`.

### D04: Database & State
- **Decision:** Embedded SQLite database to persist repos, deaths, obituaries, and hauntings with zero external DB dependencies.

### D05: Design System (Archival Minimalism via Impeccable)
- **Palette:** Dark graphite ground `oklch(16% 0.01 260)`, crisp text `oklch(92% 0.01 260)`, ash-grey ramp for dead code.
- **Accent:** Solitary accent Marigold `oklch(78% 0.15 75)`, strictly constrained to active hauntings.
- **Structure:** Hairline borders (1px solid), 2px border radius, 4px scale spacing, no cards, no gradient glassmorphism.
- **Typography:** Self-hosted `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` for 100% offline capability.

### D06: Demo Repositories Selection
- **Repo 1:** `expressjs/cors` (MIT License) - focused, clean git history with multiple legacy refactors and removals.
- **Repo 2:** `sindresorhus/is` (MIT License) - active, type-heavy repo with multiple deprecated and removed modules and test fixtures.
