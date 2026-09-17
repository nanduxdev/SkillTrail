# SkillTrail — Design

Durable design principles for SkillTrail's visual identity, voice, and UX. For token-level implementation details (CSS variables and their current values), see `app/globals.css` as the source of truth.

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

**Brand primary (oklch):**

- Light surfaces: `oklch(0.555 0.163 48.998)` — CSS: `--primary` (warm amber-orange)
- Dark surfaces: `oklch(0.473 0.137 46.201)` — CSS: `--primary` in `.dark` (deeper, richer orange-brown)
- Chart accent scale: `oklch(0.879 0.169 91.605)` → `oklch(0.769 0.188 70.08)` → `oklch(0.666 0.179 58.318)` → `oklch(0.555 0.163 48.998)` → `oklch(0.473 0.137 46.201)`

**Semantic token palette (from `globals.css`):**

| Token          | Light                       | Dark                                                    |
| -------------- | --------------------------- | ------------------------------------------------------- |
| `--background` | `oklch(1 0 0)` (white)      | `oklch(17.632% 0.00542 39.183)` (near-black, very warm) |
| `--foreground` | `oklch(0.147 0.004 49.25)`  | `oklch(0.985 0.001 106.423)` (warm off-white)           |
| `--card`       | `oklch(1 0 0)`              | `oklch(0.216 0.006 56.043)` (dark warm brown)           |
| `--muted`      | `oklch(0.97 0.001 106.424)` | `oklch(0.268 0.007 34.298)`                             |
| `--border`     | `oklch(0.923 0.003 48.717)` | `oklch(1 0 0 / 10%)`                                    |
| `--input`      | `oklch(0.923 0.003 48.717)` | `oklch(1 0 0 / 15%)`                                    |

For token-level implementation, `globals.css` is the source of truth. The above is a navigational summary only.

**Neutral palette:** paper `oklch(1 0 0)`, ink `oklch(0.147 0.004 49.25)`, warm off-white `oklch(0.985 0.001 106.423)`, muted text `oklch(0.553 0.013 58.071)`, dark card `oklch(0.216 0.006 56.043)`, dark background `oklch(17.632% 0.00542 39.183)`

**Typography:** Fraunces (display), DM Sans (body), JetBrains Mono (labels/metadata/code). The wordmark in SVG uses outlined Poppins — do not use Poppins as a product UI font.

**Logo:** The trail mark (two strokes + terminal dot) represents direction and completion without cliché. SVG assets are canonical; raster PNGs are reference only. Asset paths: `public/brand/skilltrail-logo.svg` (light), `public/brand/skilltrail-logo-white.svg` (dark). SVG mark geometry is unchanged — only the color tokens referencing the mark have shifted to the new palette.

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

- Respect `prefers-reduced-motion`. (Note: not yet globally implemented in CSS — gap to address.)
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
- Colors from the approved palette
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

## Source of Truth for Tokens

- **All semantic color tokens (primary, background, card, muted, border, etc.):** `app/globals.css`
- **Logo SVG assets:** `public/brand/`
- **Design direction (qualitative):** this file
