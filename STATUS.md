# Project Status

## Current Phase: P2 Complete -> Transitioning to P3 (Haunting Detector & Exorcise Diff Generator)

### Done (P2)
- Implemented Ollama structured output client in `src/lib/ai/client.ts` with strict schema validation and untrusted git data boundary wrappers.
- Implemented SHA citation verifier in `src/lib/ai/verify.ts` enforcing that all cited commits must exist in the death's verified context pack.
- Implemented deterministic template obituary generator in `src/lib/ai/template.ts` as an instantaneous, grounded safety floor.
- Implemented unified pipeline in `src/lib/ai/obituary.ts` which automatically validates citations and seamlessly falls back to template obituaries on hallucination or offline error.
- Verified obituary pipeline with comprehensive unit test suite in `test/obituary.test.ts` (all 5 unit tests pass).
- Conducted mini-eval benchmark on 25 hand-labeled real deaths across 3 OSS repositories (`expressjs/cors`, `sindresorhus/is`, `chalk/chalk`). Reported authentic measured numbers in `eval/RESULTS.md` (Gemma 3 1B: 80% citation validity, 1964ms latency; Deterministic Template: 80% accuracy, <1ms latency).

### Next (P3)
- Build Haunting Detector in `src/lib/ghosts/hauntings.ts` using `@vscode/ripgrep` child process:
  - Match surviving references to dead paths and exported symbols across surviving code, docs, and configs.
  - False-positive filters: ignore vendored directories (`node_modules`, `dist`, `.git`), ignore lockfiles, require minimum token length (>= 4 chars), and assign confidence scores.
  - Produce file, line number, matched snippet, and grounded match reason for each haunting.
- Implement Exorcise Diff Generator in `src/lib/ghosts/exorcise.ts`:
  - Produce clean, copy-only unified diffs removing zombie lines/imports.
  - Strictly read-only (never applies patches automatically).
- Write unit tests in `test/hauntings.test.ts` covering haunting detection and diff generation.

### Risks & Mitigations
- **Ripgrep False Positives:** Highly common tokens (e.g. `test`, `index`) can cause noisy hits. Mitigated by prioritizing basename matches, requiring boundary regex (`\b...\b`), filtering lockfiles/build dirs, and confidence ranking.
