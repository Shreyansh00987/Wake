# Project Status

## Current Phase: P1 Complete -> Transitioning to P2 (Obituary Pipeline & Mini-Eval)

### Done (P1)
- Built domain models in `src/types/index.ts` covering deaths, obituaries, hauntings, commit summaries, and scan progress.
- Implemented embedded SQLite persistence in `src/lib/db/index.ts` using built-in `node:sqlite` (zero C++ compile dependencies).
- Built safe child_process git executor in `src/lib/git/exec.ts` with strict argument arrays and timeout controls.
- Built Git Ingestion engine in `src/lib/git/ingest.ts` with rename tracking (`-M`) ensuring renamed and resurrected files are never classified as deaths.
- Built Evidence Layer in `src/lib/git/evidence.ts` extracting diffstat, author attribution, first-version snippet, and final deletion diffs.
- Created synthetic git test fixture in `test/ingest.test.ts` verifying renames, deletions, and resurrections (all 3 unit tests pass).
- Tested against real-world fixture `expressjs/cors` in `test/cors_ingest.test.ts` (verified deaths: CONTRIBUTING.md, .travis.yml, test/mocha.opts, .eslintrc, etc., with zero false positives on renamed test/cors.js).

### Next (P2)
- Build Obituary Pipeline in `src/lib/ai/obituary.ts`:
  - Structured output prompt with bounded context pack (first version snippet, final diff, commit messages).
  - Strict JSON schema validation (`summary`, `cause`, `confidence`, `cites`).
  - SHA citation verifier (MUST reject any SHA not present in supplied commits).
  - Deterministic template obituary fallback labeled `"template"` on model error or citation rejection.
- Implement mini-eval harness in `eval/harness.ts` to evaluate Gemma vs Qwen or report real benchmark results in `eval/RESULTS.md`.
- Run tests on obituary pipeline and fallback states.

### Risks & Mitigations
- **Model Hallucination on Commit SHAs:** The SHA verifier rejects any citation outside the context pack and falls back to deterministic template obituaries, preventing false claims.
- **Offline / Ollama Unavailable State:** Wake detects when Ollama is unreachable, gracefully uses template obituaries, and renders a copyable `ollama serve` guide in the UI.
