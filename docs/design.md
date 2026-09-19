# SkillTrail — Design

Durable design principles for SkillTrail's visual identity, voice, and UX.

**This file does not store color numbers, hex codes, or oklch literals.** During active development, values change in code first. For every token name and its current value, read **`app/globals.css`** — that file is the only source of truth for the palette, radii, fonts, chart scale, sidebar tokens, and launching-page aliases.

When implementing or reviewing UI, use semantic Tailwind/shadcn classes backed by those variables (e.g. `bg-background`, `text-primary`, `border-border`), or `var(--…)` in custom CSS — never duplicate palette values in components or in this doc.

---

## Core Design Idea

SkillTrail's interface should make this journey legible:

```
building things → learning things → having something worth saying
  → struggling to express it → finding the story → sharing it → building a trail
```

Layout and hierarchy answer: _Where am I in that journey?_ — not _which three SaaS features are for sale?_

---

## Visual Identity

**Character (qualitative):** Warm, editorial neutrals with an amber-orange primary — readable on light paper-like surfaces and on a deep warm dark theme. Charts and sidebar accents pull from the same warm scale as `--primary` (see `--chart-1` … `--chart-5` and `--sidebar-*` in `app/globals.css`).

**Where tokens live in `app/globals.css`:**

| Area                                 | What to look for                                                                                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App shell (shadcn / Tailwind v4)** | `:root` and `.dark` — `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--card`, `--destructive`, `--ring`, `--radius`, etc.                                              |
| **Theme bridge**                     | `@theme inline` — maps CSS variables to Tailwind color/radius utilities (`--color-primary`, `--radius-lg`, …)                                                                                |
| **Launching page aliases**           | `:root` block labeled “Launching Page Design System” — `--c-paper`, `--c-ink`, `--c-charcoal`, `--c-orange`, `--c-line`, `--c-white`, `--c-muted` plus `--f-display`, `--f-sans`, `--f-mono` |
| **Motion helpers**                   | `.reveal`, `.trail-draw`, `.illustration-float`, and `@media (prefers-reduced-motion: reduce)` at the bottom of the file                                                                     |

Light vs dark: compare the same variable name under `:root` and `.dark`. Do not assume light values apply in dark mode.

**Typography:** Display/body/mono families are defined in `app/globals.css` (`--f-display`, `--f-sans`, `--f-mono`; body uses `var(--font-sans)` from the Next.js font setup). Intent: Fraunces for display, DM Sans for UI body, JetBrains Mono for labels/metadata/code. The wordmark in SVG uses outlined Poppins — do not use Poppins as a product UI font.

**Logo:** The trail mark (two strokes + terminal dot) represents direction and completion without cliché. SVG assets are canonical; raster PNGs are reference only. Paths: `public/brand/skilltrail-logo.svg` (light), `public/brand/skilltrail-logo-white.svg` (dark). Tint logo marks with theme tokens from `globals.css`, not one-off hex in components.

**Verification:** `public/brand/brand-verification.html` — use when checking brand colors against the live token set.

---

## Design Principles

**Story before feature grid.** Problem and founder context precede capability lists. The landing page has a narrative arc (problem → why it matters → how SkillTrail helps → build with me), not a list of features.

**Editorial over template.** Authored, intentional layouts. Not the default "hero + three cards" SaaS template.

**Restraint over decoration.** Every visual element earns its place. Use negative space deliberately.

**Developer-native references.** Motifs reference real work (commits, drafts, trails). Only use commit grids, branch paths, or draft/version language when tied to the "work → story" narrative. Not as decoration.

**Distinctiveness test.** Before shipping UI, ask: _Could this exact interface belong to another random AI SaaS?_ If yes, redesign it. The interface should be recognizable as SkillTrail without seeing the logo.

---

## Anti-Patterns to Avoid

Do not use:

- Purple/blue AI gradients or floating gradient blobs
- Excessive glassmorphism
- Decorative terminal windows or code snippets with no meaning
- Generic dashboard mockups
- Generic three-card feature grids
- "AI magic" visual effects or sparkles
- Generic robot/AI imagery or stock developer photos
- Meaningless animated particles or arbitrary glowing borders
- Excessive pill-shaped or over-rounded UI
- Hype-driven or "revolutionary" language

---

## Voice and Messaging

**Brand voice:** Honest · thoughtful · technical · personal · confident without pretending scale · developer-native · practical · understated · human.

**Solo-founder language rule:** Use "I" when writing from the founder's perspective. Do not casually replace "I" with "we." Avoid "our team," "our team of experts," or "the team."

**Core message:** "You build things. SkillTrail helps you tell the story."

**Lead with the human problem, not the feature.** Weak: "AI-Assisted Content Creation." Better: "You already did the work. SkillTrail helps turn that work into a story worth sharing."

**No fabricated proof.** Never invent testimonials, user numbers, team size, funding, partnerships, awards, or capabilities not established in the product documents.

**Founding user CTA:** An invitation to participate, not a generic newsletter. Framing: "Build it with me" / "Help shape what gets built next."

**Language to avoid:** "revolutionary," "game-changing," "10x your personal brand," "dominate social media," "AI-powered growth machine," fake urgency, corporate mission statements.

### Voice by context

| Context                                    | Voice                                  |
| ------------------------------------------ | -------------------------------------- |
| Why SkillTrail exists, founding CTA, about | First-person "I" (founder)             |
| Product UI labels, empty states, help text | Direct "you"; warm but concise         |
| Error and system messages                  | Clear, technical when needed; no blame |

---

## Composition and Layout

**Prefer:** Asymmetric layouts with intentional whitespace · strong type-scale contrast (display vs body) · 1px borders and rules for section separation · meaningful negative space · product-specific motifs (trail, progress, commit-like density) · editorial magazine-spread treatment for key landing sections.

**Avoid:** Centered generic heroes with no narrative · repeated card grids for every section · floating gradient blobs · decorative glass panels.

---

## Motion

Motion communicates state, hierarchy, continuity, and feedback. Not decoration.

- Respect `prefers-reduced-motion`. Launching-page motion classes in `app/globals.css` already disable animation under `prefers-reduced-motion`; extend that pattern when adding new motion.
- Avoid: infinite particles, "AI sparkle" effects, animation for animation's sake.

---

## Responsive Design

Review targets: 375px · 768px · 1280px+.

Mobile is a **recomposed** layout (hierarchy, type scale, density) — not only stacked desktop columns.

Check on mobile: no horizontal overflow, intentional mobile hierarchy, readable typography, appropriate spacing, usable forms and CTAs.

---

## UI Quality Gate

A UI is not complete because it compiles.

Before considering a UI task complete, verify:

- Distinctive visual identity (would pass the distinctiveness test)
- Clear hierarchy, intentional typography, consistent spacing
- No generic SaaS patterns
- Colors only via tokens in `app/globals.css` (no ad-hoc hex/oklch in components)
- Motion with semantic purpose
- Keyboard navigation and visible focus states
- Sufficient contrast
- Responsive at 375px, 768px, 1280px+
- No horizontal overflow
- Hover, focus-visible, active, disabled, loading, error, success states handled

---

## Storytelling Quality Gate

For every landing-page section, ask:

1. What developer problem does this section represent?
2. What part of the founder story does it reinforce?
3. What does a developer recognize about themselves here?
4. Does the copy sound like a real developer or a marketing department?
5. Does the visual design reinforce the message?
6. Is this communicating something specific to SkillTrail?

If the answer to most is no, revise it.

---

## Source of Truth

| Concern                                                                     | Location                                           |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| Token **values** (colors, radii, fonts, charts, sidebar, launching aliases) | `app/globals.css`                                  |
| Token **usage** in React (Tailwind classes, shadcn components)              | `app/` and `components/` following variables above |
| Logo SVG assets                                                             | `public/brand/`                                    |
| Principles, voice, layout, gates (no literals)                              | this file                                          |

If this document and `globals.css` disagree, **`globals.css` wins** until you deliberately change the palette in code and then update qualitative notes here (still without copying numeric values).
