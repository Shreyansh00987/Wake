---
title: "Wake: Every Deleted Line Had a Reason (An Archival Git Necropolis)"
published: true
tags: devchallenge, hf26challenge, opensource, ai, git
cover_image: [PLACEHOLDER_COVER_IMAGE_URL]
canonical_url: [PLACEHOLDER_CANONICAL_URL]
---

*This article is submitted for the [DEV Hacktoberfest Open-Source AI Challenge: Week 4](https://dev.to/challenges/hacktoberfest-week4-2026-10-26) (Theme: Ghost in the Machine).*

---

### The Scene at the Headstone

In commit `7e6f7eeac0c16d9abed2cb84ac4b2891a51fa3dc`, an open-source maintainer quietly removed `CONTRIBUTING.md` from `expressjs/cors`. 

It was 33 lines of history. If you look at Git log today, that file is just gone. But if you open **Wake**, that deletion is preserved forever on a stone slab:

> **Born:** 2017-10-04 (Commit `78dd894`)  
> **Died:** 2025-11-30 (Commit `7e6f7ee`)  
> **Lifespan:** 2,979 days  
> **Last Words:** `"docs: revamp content (#374)"`  
> **Grounded Obituary:** *"Removed CONTRIBUTING.md after 2979 days. Purged 33 lines of historical code."*  
> **Citations:** `commit 7e6f7ee` *(clickable chip that expands the author, timestamp, and diff inline)*  

And then comes the twist. 

When you look below the headstone, a solitary amber-gold warning appears: **`STILL HAUNTING`**. Wake's regex engine traced active survivor files across the repository and found that a living documentation file still contained a dangling markdown link pointing to that dead file.

This is **Wake**: an archival necropolis for dead code, and an exorcist for the ghosts left behind.

---

## What I Built

**Wake** is an end-to-end, local-first web application that inspects Git repositories, deterministically tracks deleted files, writes grounded obituaries using a local open-weight model (`gemma3:1b`), and locates the "ghosts"—active code, documentation, and configuration files that still reference things that died.

### Core Architecture & Guiding Philosophy

Wake was built around a strict principle of **Honest AI**:
1. **Deterministic Facts, Local Narration:** Git analysis produces 100% of the facts. A local open-weight model running on consumer hardware via Ollama only narratively explains and categorizes. The model is never permitted to invent facts.
2. **SHA Verification Safety Shield:** Every claim in an obituary must cite a real commit SHA from that death's verified context pack. If an LLM hallucinates a commit SHA, Wake immediately rejects it and falls back to a deterministic template obituary labeled `[TEMPLATE]`.
3. **Ghost in the Machine (Haunting Detector):** Using ripgrep with token boundary heuristics, Wake discovers surviving imports, dead symbols, and stale markdown references.
4. **Exorcise (Read-Only Diff Generator):** Wake never touches or mutates your repository. The Exorcise tool generates a standard unified diff that maintainers can copy and apply with `git apply`.
5. **Archival Minimalism:** Built using [Impeccable](https://impeccable.style), Wake features a dark graphite ground (`oklch(16% 0.01 260)`), hairline borders, 2px radii, self-hosted IBM Plex typography, and a single accent—Marigold (`oklch(78% 0.15 75)`)—strictly and solely reserved for active hauntings.

---

## Demo & Repository

- **GitHub Repository:** [https://github.com/Shreyansh00987/Wake](https://github.com/Shreyansh00987/Wake)
- **Hosted Interactive Demo:** [https://wake-necropolis.onrender.com](https://wake-necropolis.onrender.com) *(Serves authentic precomputed scans from `samples/` since cloud free-tier containers lack local Ollama GPU/CPU runtimes).*
- **Video Walkthrough (1:12):** [Demo Video Walkthrough (1080p Full HD MP4 with AI Narration)](https://github.com/Shreyansh00987/Wake/raw/main/wake_demo_walkthrough.mp4)

---

## How I Built It

Wake was engineered with a modern, fully offline-capable stack:

- **Frontend & Framework:** Next.js 14 (App Router, TypeScript, Tailwind CSS).
- **Embedded Database:** Native `node:sqlite` (Node.js 24 built-in C-SQLite engine, zero external C++ compile dependencies).
- **Data Ingestion:** Native Git CLI (`child_process.spawn`) with `-M` rename detection. When a file is moved (e.g. `test/cors.js` -> `test/test.js`), Wake tracks the rename lineage and never falsely classifies it as a death.
- **Search Tooling:** `@vscode/ripgrep` bundled binary executed with strict argument arrays (never shell-interpolated strings).
- **Timeline Visualization:** D3.js timeline with interactive time scales and responsive fallback to vertical month lists on mobile.
- **Local AI Runtime:** [Ollama](https://ollama.com/) running `gemma3:1b` (806 MB, Q4_K_M quantization, licensed under the [Google Gemma Terms of Use](https://ai.google.dev/gemma/terms)).
- **Fonts:** Self-hosted `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` for 100% offline functionality.

### The Ingestion Pipeline

```
[Git Repo] 
   │
   ├─► git ls-files (Load surviving files)
   ├─► git log -M --name-status (Extract deletions & trace renames)
   │
   ▼
[Evidence Extraction] 
   │ (diffstat, birth SHA, death SHA, lifespan, authors, last words)
   │
   ▼
[Ollama Inference: gemma3:1b] ◄── [Structured JSON Schema]
   │
   ▼
[SHA Citation Verifier]
   ├── Valid citations? ──► [Verified Grounded Obituary]
   └── Hallucinated SHA? ──► [Deterministic Template Fallback]
   │
   ▼
[Ripgrep Haunting Detector]
   ├── Scan surviving code, docs, configs (excluding node_modules, lockfiles)
   └── Detect dangling imports & references
   │
   ▼
[Exorcise Engine] ──► Produces Copy-Only Unified Diff
```

---

## Empirical Evaluation: Real Numbers

To maintain total credibility, I evaluated Wake against **25 hand-labeled historical deletions** across three popular open-source repositories: `expressjs/cors` (MIT), `sindresorhus/is` (MIT), and `chalk/chalk` (MIT).

Here are the real, unvarnished measurements from `eval/RESULTS.md`:

| System / Model | Cases | Citation Validity Rate | Cause Accuracy | Avg Latency | Fallback Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Deterministic Template Engine** | 25 | **100.0%** (25/25) | **80.0%** (20/25) | < 1ms | 0% |
| **gemma3:1b (Open-Weight)** | 25 | **80.0%** (20/25) | **28.0%** (7/25) | 1,964ms | 20% (5/25) |
| **qwen2.5-coder:1.5b** | 25 | *Not run* | *Not run* | *N/A* | *N/A* |

### What the Numbers Tell Us
1. **The Safety Shield is Mandatory:** Even small open-weight models (`gemma3:1b`) occasionally hallucinate or output commit hashes slightly transposed from the prompt. In 5 out of 25 cases (20%), Gemma outputted a non-existent commit citation. Wake's SHA verifier caught every single one and gracefully reverted to template obituaries, ensuring zero fabricated citations reached the maintainer.
2. **Complementary Hybrid Design:** The deterministic template engine acts as a zero-latency baseline with 80% cause accuracy on common Git keywords, while `gemma3:1b` provides rich narrative context on complex multi-commit refactors.

---

## Why Open Innovation Matters

Building Wake entirely on open-source software and open-weight models was not a compromise—it was the only design that makes ethical sense for software developers:

1. **Code Privacy & Zero Data Exfiltration:** Maintainers cannot paste proprietary or sensitive internal codebases into cloud LLM APIs. Wake runs completely inside your machine. Disconnect your Wi-Fi, scan your repository, and watch it generate grounded obituaries with zero bytes leaving your network.
2. **Zero Operating Cost ($0):** Open-weight models like `gemma3:1b` (806 MB) run fast on everyday laptops without specialized GPU clusters. No recurring subscriptions, no API rate limits, no tokens-per-minute throttles.
3. **Longevity & Reproducibility:** Proprietary model APIs get deprecated, updated, or shuttered. An open-weight model with an open-source inference engine (Ollama) will run the exact same way ten years from now.

---

## What Didn't Work & Honest Limitations

- **Small Model Nuance:** `gemma3:1b` is extraordinarily lightweight (806 MB), but its ability to differentiate between a `refactor` and an `abandoned_experiment` solely from short Git commit messages is noisy (28% exact cause match). The deterministic regex engine actually outperformed the 1B LLM on category categorization. However, the LLM excels at synthesizing the human summary.
- **Short Token False Positives in Hauntings:** If a deleted file is named `test.js` or `data.ts`, searching for `test` across a codebase triggers hundreds of false positives. Wake mitigates this by requiring token lengths >= 4 characters and filtering common programming keywords, but maintainers must always review confidence scores.
- **Cloud Hosting Reality:** Free-tier cloud web services (Render, Vercel) cannot run Ollama with local model weights. Hence, the hosted demo honestly serves precomputed sample scans (`samples/wake.json` and `samples/cors.json`). True real-time local scanning is intended for developers running `npm run dev` or `docker-compose up` on their own machines.

---

## The Spirit of It

Code is written by humans. Every deleted file represented someone's late night, an architecture that served its time, or a lesson learned the hard way. Wake treats code history not as an untangled pile of diffs, but as a dignified cemetery.

And when you exorcise that final lingering ghost from your `README.md` or `package.json`, you give that deleted line the peace it deserves.

---

## Prize Categories

- **Overall Challenge Winner**
- **Partner Categories:** [PLACEHOLDER_SELECTED_PARTNER_CATEGORIES]
