# SkillTrail Brand Identity

## Status

Source of truth for **who SkillTrail is** — identity, visual language at a high level, and approved brand assets.

**Hierarchy (brand decisions):**

```text
Product / founder context (AGENTS.md, product docs)
        ↓
brand-identity.md (this file)
        ↓
design-direction.md
        ↓
voice-and-messaging.md · ui-foundations.md
        ↓
Implementation (app, public assets)
```

**Visual assets:**

```text
Finalized SVG files in public/brand/
        ↓
public/brand/brand-verification.html
        ↓
Brand documentation (this file and siblings)
        ↓
Implementation
```

---

## Brand Essence

SkillTrail is a **developer-built product for developers** who already do meaningful technical work but struggle to turn that work into stories, a personal brand, and a consistent presence online.

The brand should feel like **craft and honesty**, not corporate marketing or generic “AI startup” energy.

---

## What SkillTrail Is

A product that helps developers **find the story inside work they have already done** and turn it into content worth sharing — with assistance for drafting, personalization, publishing, and consistency over time.

**Guidance:** SkillTrail is not positioned as turning developers into full-time influencers or content agencies.

---

## Why SkillTrail Exists

Building software and communicating its value are different skills. SkillTrail exists because the founder experienced that gap personally and is building the tool he wished he had — **one iteration at a time**, informed by real developer feedback.

---

## Brand Personality

| Quality | Expression |
| -------- | ----------- |
| Developer-native | Speaks from building, shipping, and learning — not from a marketing department |
| Thoughtful | Considers depth, angle, and voice — not volume for its own sake |
| Honest | No inflated claims, fake traction, or pretend scale |
| Technical | Comfortable with real engineering context without performative “hacker” aesthetics |
| Personal | Solo-founder context is visible, not hidden behind “we” |
| Craft-oriented | Care in typography, color, and composition |
| Understated | Confident without hype |
| Human | A person solving a person’s problem |

---

## Brand Character

SkillTrail should read as **one developer building for developers** — practical, direct, and respectful of the audience’s intelligence.

---

## What SkillTrail Is Not

**Rule:** Do not present SkillTrail as:

- A large startup team or agency
- A generic AI SaaS or “growth machine”
- Hype-driven personal-brand coaching
- Influencer or “creator economy” marketing
- A futuristic “AI magic” product aesthetic
- Corporate, bloated, or exaggerated in promise

---

## Founder Context

**Guidance:** Use **“I”** when describing why SkillTrail exists and who is building it, unless the user explicitly requests otherwise.

Founding users are **early developers helping shape a product they need** — not a passive email list.

---

## Core Product Idea

```text
You already did the work.
SkillTrail helps uncover the story inside it
and turn that story into something worth sharing.
```

---

## Visual Identity

The visual identity ties **code → work → thought → story → publishing → presence**.

The logo mark is a **trail**: two weighted strokes and a terminal dot — progress, direction, and arrival without literal map or hiking clichés.

**Observed in assets:** Mark stroke color on default SVG lockups is `#B44822` on light backgrounds. Dark-mode **interactive** orange is `#D85B2A` (see Color Identity). Geometry is fixed; colors adapt by context.

---

## Logo System

# Asset Registry

| Asset | Path | Format | Purpose |
|---|---|---|---|
| **Primary horizontal lockup** | `public/brand/skilltrail-logo.svg` | SVG | Full wordmark + mark on light surfaces |
| **Reverse horizontal lockup** | `public/brand/skilltrail-logo-white.svg` | SVG | Full wordmark + mark on dark surfaces |
| **Standalone mark** | `public/brand/skilltrail-mark.svg` | SVG | Compact contexts; orange mark on light/transparent surfaces |
| **Reverse standalone mark** | `public/brand/skilltrail-mark-white.svg` | SVG | Mark only on dark surfaces |
| **Favicon** | `public/brand/favicon.svg` | SVG | Browser favicon; standalone mark with favicon-specific viewBox |
| **Brand verification** | `public/brand/brand-verification.html` | HTML | Rendered reference and verification checklist |
| **Logo raster reference** | `public/brand/skilltrail-logo.png` | PNG | Raster reference/export; not preferred for UI embedding |
| **Logo preview** | `public/brand/skilltrail-logo-preview.png` | PNG | Visual preview/reference |
| **Social avatar** | `public/brand/skilltrail-social-avatar.png` | PNG | Social/profile avatar; white mark on brand-orange square |

## Asset Rules

- SVG assets are the **canonical production logo assets**.
- Raster PNG files are **derived/reference assets**, not the source of truth.
- Use the **horizontal lockup** when sufficient space is available.
- Use the **standalone mark** for compact UI contexts.
- Use the **white variants** on dark surfaces.
- Use the **favicon** specifically for browser/tab icon usage.
- Use the **social avatar** for external social/profile accounts.
- Do not embed raster logo references in the application UI when the equivalent SVG is available.
- Do not create additional logo variants unless a concrete product or platform requirement requires one.

**Rule:** Use these paths exactly — SVG lockups are lowercase `skilltrail-*`; raster PNGs use camelCase `skillTrail-*`.

### Primary Horizontal Lockup

**File:** `skilltrail-logo.svg`

- Mark: orange `#B44822` strokes + dot
- Wordmark: vector outlines, fill `#383C41` (charcoal) — **no live font dependency at render time**

### Reverse Horizontal Lockup

**File:** `skilltrail-logo-white.svg`

- Entire lockup recolored to white geometry on dark fields — same paths, not redrawn

### Standalone Mark

**File:** `skilltrail-mark.svg`

- Two round-cap strokes + circle; viewBox `28.45 36.42 705.12 534.94`

### Reverse Standalone Mark

**File:** `skilltrail-mark-white.svg`

- Same geometry, white fills/strokes

### Favicon

**File:** `favicon.svg`

- Cropped viewBox (`44.45 52.42 673.12 502.94`) for tab legibility
- **Brand rule:** Silhouette must hold from large display down to ~16px tab size (`brand-verification.html` checklist)

---

## Logo Usage Rules

**Rule:** Do not redraw, distort, skew, or change mark proportions.

**Rule:** Do not add gradients, filters, masks, or embedded raster data inside logo SVGs (`brand-verification.html` checklist).

**Rule:** Use the correct variant for the surface:

- Light background → `skilltrail-logo.svg` / `skilltrail-mark.svg` (orange `#B44822` in shipped mark files)
- Dark background → `skilltrail-logo-white.svg` / `skilltrail-mark-white.svg`, or orange mark at `#D85B2A` where dark-mode UI verification shows branded chrome (see verification mockups)

**Guidance:** Prefer horizontal lockup when the name “SkillTrail” should be readable; use standalone mark in tight spaces (nav icon, favicon, avatar).

**Guidance:** Verification shows example render widths (180 / 96 / 48 / 24 px) for QA — not a formal minimum-size spec in code.

--On dark UI surfaces, use the white logo variants. Use the orange mark only where the standalone mark is appropriate and provides sufficient contrast.

---

## Color Identity

Approved palette is defined in `brand-verification.html` and mirrored in `app/globals.css` for product UI.

### Approved Color Palette

| Name | Hex | Role |
| ---- | --- | ---- |
| SkillTrail Orange (light primary) | `#B44822` | Brand orange on light surfaces; light-mode buttons, links, accents |
| SkillTrail Orange (dark primary) | `#D85B2A` | Higher-luminance primary on dark surfaces; interactive accents in dark UI |
| Charcoal | `#383C41` | Wordmark / secondary text on light |
| Ink | `#14171A` | Primary text on light |
| Paper | `#F7F6F2` | Light background |
| Line | `#DEDBD2` | Borders/dividers on light |
| White | `#FFFFFF` | Cards, knockouts |

**Source:** `:root` CSS variables in `brand-verification.html`; semantic tokens in `app/globals.css` (`:root` / `.dark`).

### Color Roles

- **Light mode:** Primary interactive = `#B44822`; backgrounds lean paper/white; text ink/charcoal.
- **Dark mode:** Primary interactive = `#D85B2A`; backgrounds deep neutrals; foreground ivory tones in app tokens.

**Rule:** Do not substitute other oranges (e.g. `#FF6B00`) without an explicit brand decision.

---

## Typography Identity

### Logo / wordmark

**Brand rule:** Wordmark in SVGs is **outlined Poppins** (Bold/Regular weight contrast in source artwork) — converted to paths; Poppins is **not** required at runtime for the logo (`brand-verification.html` checklist).

### Product / marketing UI

**Current implementation:** Display and UI type in `app/globals.css` use **Fraunces** (display), **DM Sans** (sans/body), and **JetBrains Mono** (mono). See `ui-foundations.md` for conflicts with root layout font loading.

**Guidance:** Product typography and logo typography are intentionally different systems — do not replace Fraunces with Poppins in UI to “match” the wordmark.

---

## Imagery / Graphic Language

- **Trail / progress:** Lines, paths, and discrete steps — not generic chart junk
- **Developer-native cues:** Commit-like grids, monospace labels, editorial layout — only when they support the story
- **Restrained color:** Orange as accent, neutrals as structure
- **No** stock “AI brain,” robots, or purple gradient hero tropes

---

## Brand Do's

- Lead with the human problem before feature language
- Show solo-founder honesty and iteration
- Use approved hex values and finalized SVGs
- Keep composition editorial and intentional
- Treat founding users as collaborators

---

## Brand Don'ts

- Invent testimonials, user counts, or team scale
- Use hype/growth-hacking tone
- Redesign or “refresh” the mark in product UI
- Default to generic AI SaaS visuals
- Imply capabilities not established in product docs

---

## Source Files

| File | Role |
| ---- | ---- |
| `public/brand/*.svg` | Canonical logo/favicon geometry and default colors |
| `public/brand/brand-verification.html` | Approved colors, usage mockups, verification checklist |
| `app/globals.css` | Product semantic colors and typography tokens |
| `AGENTS.md` | Product story, tone constraints, design workflow |
| `docs/brand/design-direction.md` | How interfaces should feel |
| `docs/brand/voice-and-messaging.md` | How SkillTrail speaks |
| `docs/brand/ui-foundations.md` | Token-level implementation reference |

**Note:** `docs/design-direction.md` at repo root is an earlier, shorter design brief. `docs/brand/design-direction.md` is the expanded canonical design-direction doc for the brand doc set. `AGENTS.md` still references `./docs/design-direction.md` — align references when updating agent instructions.

---

## Known Gaps

- Raster PNGs are reference/deliverable artifacts; no formal rule for when to use PNG vs SVG in marketing
- Dark-mode logo color (`#D85B2A` mark vs white lockup) context rules are illustrated in verification but not encoded as app-level logo components yet
