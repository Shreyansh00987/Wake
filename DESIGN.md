# DESIGN.md: Archival Minimalism System

## 1. Design Direction: Archival Minimalism
Wake is a solemn, utilitarian historical archive for software archaeology. It rejects SaaS consumer tropes (no gradient cards, no neon glows, no glassmorphism, no rounded-2xl bubbles) in favor of hairline precision and evidence-first readability.

---

## 2. Color Palette & Semantics

| Token | OKLCH Value | Semantic Role |
| :--- | :--- | :--- |
| `ground` | `oklch(16% 0.01 260)` | Deep slate graphite foundation |
| `surface` | `oklch(20% 0.01 260)` | Elevated hairline panels and table hover ground |
| `hairline` | `oklch(26% 0.01 260)` | Structural 1px division rules |
| `hairline-light`| `oklch(34% 0.01 260)` | Interactive focus and active borders |
| `content` | `oklch(92% 0.01 260)` | High-contrast body text and prominent headers |
| `ash-light` | `oklch(75% 0.01 260)` | Secondary explanations and commit summaries |
| `ash` | `oklch(60% 0.01 260)` | Section labels and metadata timestamps |
| `ash-dark` | `oklch(40% 0.01 260)` | Subtle delimiters and commit hashes |
| **`marigold`** | **`oklch(78% 0.15 75)`** | **SOLITARY ACCENT:** Constrained exclusively to active hauntings |

> **Architectural Rule:** Marigold is never used for general buttons, success states, or decoration. It is reserved purely for the "ghost in the machine" warning.

---

## 3. Typography & Self-Hosting

Wake functions 100% offline with self-hosted fonts bundled via `@fontsource`:
- **UI & Prose:** `IBM Plex Sans` (Weights: 400 Regular, 500 Medium, 600 Semi-Bold)
- **Code & Metadata:** `IBM Plex Mono` (Weights: 400 Regular, 500 Medium)
- **Numerals:** Tabular numbers (`tabular-nums` / `font-feature-settings: "tnum" 1`) applied to all timestamps, day counts, and diff stats for vertical alignment across ledger rows.

---

## 4. Spacing, Rules & Geometry

- **Hairline Rules:** All content sections and list items are separated by 1px solid rules (`border-hairline`). No multi-layered nested cards.
- **Corner Radii:** Strictly 2px (`rounded-sm`).
- **Spacing Scale:** Built on a rigorous 4px baseline:
  - 1 unit: 4px
  - 2 units: 8px
  - 3 units: 12px
  - 4 units: 16px
  - 6 units: 24px
  - 10 units: 40px
  - 16 units: 64px

---

## 5. Motion & Transitions

- **Ingestion Loading:** Scanning streams progress via Server-Sent Events. Gravestones appear in the timeline staggered at ~40ms intervals matching git log playback.
- **Hover Transitions:** Interactive table items lift 1px upwards over 150ms (`transition: transform 150ms ease`).
- **Accessibility:** All transforms and animations are gated by `@media (prefers-reduced-motion: no-preference)`.

---

## 6. Accessibility & States

- **Contrast:** Base text-to-ground contrast exceeds WCAG AAA (> 11:1). Ash secondary text exceeds WCAG AA (> 5.5:1).
- **Focus Rings:** High-visibility 2px solid white rings with 2px offset (`focus-visible`).
- **Empty State:** Clean, understated tombstone marker ("Nothing has died here yet.") with clear action hints.
- **Error States:** Graceful degraded UI showing copyable `ollama serve` instructions when the model runtime is offline.
