# Phase 2 Plan: Obituary Pipeline, SHA Verifier, Fallbacks & Mini-Eval
1. Build Ollama client in src/lib/ai/client.ts with structured schema enforcement and prompt isolation of untrusted git data.
2. Implement SHA verifier in src/lib/ai/verify.ts strictly rejecting any cited commit SHA not present in the context pack.
3. Implement deterministic template fallback generator in src/lib/ai/template.ts labeled as "template" in the UI.
4. Combine into unified obituary generator in src/lib/ai/obituary.ts with offline graceful degradation.
5. Build mini-eval harness in eval/harness.ts, test on hand-labeled deaths, and generate real numbers in eval/RESULTS.md.
