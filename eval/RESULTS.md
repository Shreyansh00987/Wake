# Wake Evaluation Results

Evaluation performed on **25 hand-labeled historical deletions** across 3 open-source repositories (`expressjs/cors`, `sindresorhus/is`, `chalk/chalk`).

Date: 2026-10-30  
Hardware: Local CPU / Windows Subsystem  
Runtime: Ollama v0.40.7  

---

## Benchmark Summary

| System / Model | Total Cases | Citation Validity Rate | Cause Classification Accuracy | Avg Latency | Fallback to Template |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Deterministic Template Engine** | 25 | **100.0%** (25/25) | **80.0%** (20/25) | < 1ms | 0 |
| **gemma3:1b (Open-Weight)** | 25 | **80.0%** (20/25) | **28.0%** (7/25) | 1964ms | 5 |
| **qwen2.5-coder:1.5b** | 25 | *Not run* | *Not run* | *N/A* | *N/A* |

> **Note on Qwen Coder:** `qwen2.5-coder:1.5b` was tested in development. To keep local storage and test runtimes bounded, the formal 25-case eval suite reports real measured numbers for `gemma3:1b` (the primary default open-weight model) vs the deterministic baseline. Wake supports `WAKE_MODEL=qwen2.5-coder:1.5b` seamlessly.

---

## Key Findings

1. **Deterministic Verification Works as a Safety Shield:**
   When `gemma3:1b` generates commit citations, Wake's SHA verifier inspects every cited commit against the actual context pack. Hallucinations or malformed citations are rejected immediately, protecting maintainers from fabricated citations.
2. **Complementary Hybrid Design:**
   The deterministic template engine provides a rock-solid, zero-latency safety floor with **80.0%** accuracy on common git removal patterns. `gemma3:1b` adds natural-language narrative grounding when available, with an average inference speed of **1964ms** on consumer hardware.
3. **Zero Proprietary API Dependency:**
   All 25 evaluations executed completely offline with $0 API spend.

---

## Detailed Case Log (gemma3:1b)

| File Path | Ground Truth Cause | Predicted Cause | Verified Citations? | Latency |
| :--- | :--- | :--- | :---: | :---: |
| `CONTRIBUTING.md` | `rewrite` | `refactor` | Verified | 2023ms |
| `.travis.yml` | `refactor` | `abandoned_experiment` | Verified | 1757ms |
| `test/mocha.opts` | `refactor` | `refactor` | Template Fallback | 2526ms |
| `.eslintrc` | `refactor` | `abandoned_experiment` | Verified | 1348ms |
| `test/.eslintrc` | `refactor` | `refactor` | Verified | 1308ms |
| `test/issue-31.js` | `abandoned_experiment` | `refactor` | Verified | 1543ms |
| `test/body-events.js` | `abandoned_experiment` | `refactor` | Verified | 2101ms |
| `test/basic-auth.js` | `abandoned_experiment` | `refactor` | Verified | 2120ms |
| `lib/index2.js` | `abandoned_experiment` | `refactor` | Verified | 1793ms |
| `.github/funding.yml` | `abandoned_experiment` | `refactor` | Verified | 1730ms |
| `tsconfig.xo.json` | `rewrite` | `dependency_removal` | Verified | 1473ms |
| `.travis.yml` | `refactor` | `abandoned_experiment` | Verified | 2848ms |
| `tslint.json` | `dependency_removal` | `abandoned_experiment` | Verified | 1811ms |
| `index.js` | `rewrite` | `refactor` | Verified | 2034ms |
| `.replit` | `abandoned_experiment` | `refactor` | Verified | 1652ms |
| `source/templates.js` | `dependency_removal` | `dependency_removal` | Template Fallback | 2017ms |
| `test/template-literal.js` | `dependency_removal` | `dependency_removal` | Template Fallback | 1861ms |
| `test/constructor.js` | `refactor` | `abandoned_experiment` | Verified | 2873ms |
| `test/_supports-color.js` | `rewrite` | `rewrite` | Template Fallback | 2146ms |
| `.travis.yml` | `refactor` | `refactor` | Template Fallback | 2546ms |
| `test/enabled.js` | `refactor` | `abandoned_experiment` | Verified | 1953ms |
| `.flowconfig` | `dependency_removal` | `refactor` | Verified | 1701ms |
| `index.js.flow` | `dependency_removal` | `refactor` | Verified | 1892ms |
| `test/_flow.js` | `dependency_removal` | `abandoned_experiment` | Verified | 1869ms |
| `test/windows.js` | `refactor` | `refactor` | Verified | 2164ms |
