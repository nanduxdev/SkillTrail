# SkillTrail Design Direction

## Purpose

Guide designers and AI agents on **how SkillTrail should feel** — composition, mood, and product-specific visual language — without replacing token-level specs in `ui-foundations.md` or identity rules in `brand-identity.md`.

---

## Core Design Idea

SkillTrail’s interface should make this journey legible:

```text
building things
      ↓
learning things
      ↓
having something worth saying
      ↓
struggling to express it
      ↓
finding the story
      ↓
sharing it
      ↓
building a recognizable trail
```

Hierarchy and layout should answer: *where am I in that journey?* — not *which three SaaS features are for sale?*

---

## Design Philosophy

### Recommended design principle

- **Story before feature grid** — problem and founder context precede capability lists
- **Editorial over template** — authored layouts, not default “hero + three cards”
- **Restraint over decoration** — every visual element earns its place
- **Developer reality** — motifs reference real work (commits, drafts, trails), not decorative terminal windows
- **Distinctiveness test** — if the UI could belong to any AI startup, redesign

### Observed in current implementation

- Landing page uses **Fraunces / DM Sans / JetBrains Mono** via CSS variables and section-level inline `fontFamily`
- **Commit-grid motif** on marketing page (gold-tinted cells) — **discrepancy:** cells use `rgba(201, 168, 76, …)` (legacy gold), not approved `#B44822` / `#D85B2A` (see `ui-foundations.md` Known Exceptions)
- Section labels with mono uppercase tracking and horizontal rules echo verification HTML’s section-label pattern
- `brand-verification.html` mock UI uses **6px** button/card radii; shadcn `Button` uses **`rounded-4xl`** — radii are not unified yet

---

## Emotional Qualities

Thoughtful · honest · technical · personal · focused · craft-oriented · understated · confident · human

Avoid: corporate polish, hype, playfulness for its own sake, futuristic “AI product” theatrics.

---

## Visual Personality

- **Warm neutral base** (paper / ink / ivory) with **SkillTrail orange** as the decisive accent
- **Dark surfaces** for depth and focus — not neon cyberpunk
- **Serif display + clean sans body** in product CSS (Fraunces + DM Sans)
- **Monospace** for labels, metadata, and technical affordances

---

## Composition

**Prefer (recommended):**

- Asymmetric layouts and intentional whitespace
- Strong type scale contrast (display vs body)
- Borders and rules that structure content (verification HTML uses 1px line dividers)
- Meaningful negative space
- Product-specific motifs (trail, progress, commit-like density)

**Avoid (recommended):**

- Centered generic heroes with no narrative
- Repeated card grids for every section
- Floating gradient blobs and glass panels
- Decorative code snippets with no meaning

**Observed:** Marketing page uses custom breakpoints at **900px** and **560px**; verification board uses **820px** — not a single shared breakpoint system.

---

## Typography Direction

**Brand rule:** Logo wordmark = outlined Poppins in SVG only.

**Current implementation:** UI display = Fraunces (`--font-display`); body = DM Sans (`--font-sans`); mono = JetBrains Mono (`--font-mono`).

**Recommended:** Treat display type as part of identity — do not default to Inter, Roboto, or Arial as the hero face.

---

## Color Direction

**Brand rule:**

- Light primary: `#B44822`
- Dark primary: `#D85B2A`
- Neutrals: paper `#F7F6F2`, ink `#14171A`, charcoal `#383C41`, line `#DEDBD2`

**Recommended:** Orange for **action and emphasis**; neutrals for **structure and reading**; avoid rainbow chart palettes unrelated to brand hue (globals.css chart tokens stay in orange family — good pattern).

**Avoid:** Purple/blue AI gradients, arbitrary neon accents, multiple competing accent colors.

---

## Surfaces

**Observed in tokens (`globals.css`):**

- Light: `--background` paper, `--card` white, muted secondary surfaces
- Dark: `--background` `#08090D`, cards `#0E1018`, elevated `#141720`

**Recommended:** Prefer flat or subtly bordered surfaces over glassmorphism.

Verification mockups use sidebar `#FAF9F6` (light) and deep charcoal stacks (dark) — align new UI with semantic tokens where possible.

---

## Borders and Structure

**Observed:** Light border token `#DEDBD2`; dark `#1D2030`; verification uses 1px rules for section separation.

**Recommended:** Deliberate 1px borders and left-accent notes (verification “note” panels use 2px brand-colored left border) for callouts.

---

## Visual Motifs

### Trail / Progress Concept

- Logo: two segments + terminal dot — **direction and completion**
- Progress bars in verification UI: 6px height, pill caps, brand fill
- **Recommended:** Use trail/progress semantics for onboarding and publishing flow, not as generic loading decoration

### Developer-Native References

- Commit contribution grids, branch-like paths, draft/version language
- **Rule:** Only use when tied to “work → story” narrative

---

## Editorial Qualities

Treat key landing sections like **magazine spreads**: headline, dek, pull quotes, and footnotes — not feature bullets alone.

**Guidance:** Vary section intent (problem, thesis, how it helps, build-with-me) per `AGENTS.md` storytelling gate.

---

## Motion Philosophy

**Recommended:**

- Motion communicates state, hierarchy, continuity, and feedback
- Respect `prefers-reduced-motion` (stated in legacy `docs/design-direction.md`; not yet globally implemented in CSS — **gap**)

**Observed:** Marketing page uses fade-in + `translateY(18px)` on mount via inline JS; `tw-animate-css` is imported in `globals.css`.

**Avoid:** Animation for decoration, infinite particles, “AI sparkle” effects.

---

## What to Prefer

Strong typography · editorial composition · restrained color · meaningful asymmetry · generous negative space · deliberate borders · subtle technical references · purposeful motion · product-specific motifs

---

## What to Avoid

Generic gradients · random blobs · excessive glass · meaningless glow · excessive cards · generic dashboards · decorative code · AI sparkle effects · interchangeable SaaS templates

---

## Generic AI SaaS Anti-Patterns

See list in `AGENTS.md` §9 (purple gradients, glassmorphism, three-card grids, etc.). **Distinctiveness test:**

> Could this exact interface belong to another random AI SaaS?

If yes, reconsider.

---

## Distinctiveness Test

Before shipping UI:

> What would make someone recognize this as SkillTrail without seeing the logo?

If the answer is “nothing,” strengthen hierarchy, motif, or tone — not more decoration.

---

## Responsive Design Philosophy

**Design review targets (from AGENTS.md):** 375px · 768px · 1280px+ — use for QA, not as implied CSS breakpoint names.

**Recommended:** Mobile is a **recomposed** layout (hierarchy, type scale, density), not only stacked desktop columns.

**Observed:** `brand-verification.html` collapses grids at 820px; marketing page at 900px / 560px.

---

## Design Decision Checklist

1. What developer problem does this section represent?
2. What part of the founder story does it reinforce?
3. Does copy sound like a developer, not marketing?
4. Are colors from the approved palette?
5. Are logos from `public/brand/` without modification?
6. Does motion have semantic purpose?
7. Does it pass the distinctiveness test?
8. Is anything presented as fact that isn’t established (traction, team size)?

---

## Source of Truth Hierarchy

```text
brand-identity.md
        ↓
design-direction.md (this file)
        ↓
ui-foundations.md + voice-and-messaging.md
        ↓
Code and assets
```

---

## Relationship to `docs/design-direction.md`

The repo root `docs/design-direction.md` is a **short agent brief** (anti-patterns, motion, responsive notes). This file **extends** that guidance with SkillTrail-specific narrative, observed implementation notes, and explicit observed vs recommended labeling. Prefer **this file** when working inside the `docs/brand/` documentation set.
