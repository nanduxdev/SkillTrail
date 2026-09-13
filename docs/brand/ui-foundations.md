# SkillTrail UI Foundations

## Purpose

Document **how the visual system is implemented** — tokens, themes, and global behavior — primarily from `app/globals.css` and `public/brand/brand-verification.html`. Use `design-direction.md` for qualitative guidance.

**Labeling:**

- **Defined in CSS** — explicit variable or rule in `globals.css`
- **Brand reference** — `brand-verification.html`
- **Observed** — used in components/pages but not tokenized
- **Gap** — not implemented or inconsistent

---

## Design Tokens

SkillTrail uses **Tailwind CSS v4** with `@theme` and **shadcn/ui** semantic tokens (`:root` / `.dark`). Custom brand colors also appear in `@theme` as `--color-brand-light` / `--color-brand-dark` and legacy `--color-gold*` aliases.

There is **no centralized spacing scale** in CSS — spacing is implemented via Tailwind utility classes.

---

## Color

### Brand Colors

| Token / name | Value | Role | Source |
| ------------ | ----- | ---- | ------ |
| Light primary | `#B44822` | Buttons, links, ring, charts on light | `:root --primary`, `--brand-primary`, `--color-brand-light`, `--color-gold` |
| Dark primary | `#D85B2A` | Buttons, ring, accents on dark | `.dark --primary`, `--brand-primary`, `--color-brand-dark`, `--color-gold-light` |
| Gold dim (legacy) | `#8A3519` | Legacy alias | `--color-gold-dim` |

**Brand reference (`brand-verification.html`):** `--orange`, `--dark-orange` match above.

### Semantic Colors — Light (`:root`)

| Token | Value |
| ----- | ----- |
| `--background` | `#F7F6F2` |
| `--foreground` | `#14171A` |
| `--card` | `#FFFFFF` |
| `--card-foreground` | `#14171A` |
| `--popover` | `#FFFFFF` |
| `--popover-foreground` | `#14171A` |
| `--primary` | `#B44822` |
| `--primary-foreground` | `#FFFFFF` |
| `--secondary` | `#EEECE5` |
| `--secondary-foreground` | `#383C41` |
| `--muted` | `#F0EEE8` |
| `--muted-foreground` | `#6F7378` |
| `--accent` | `#F1E8E3` |
| `--accent-foreground` | `#7E351E` |
| `--destructive` | `#B42318` |
| `--border` | `#DEDBD2` |
| `--input` | `#D8D5CD` |
| `--ring` | `#B44822` |

**Chart palette (light):** `--chart-1` … `--chart-5` = `#B44822`, `#D85B2A`, `#E77A50`, `#963B1D`, `#6F2D18` (orange family — **Defined in CSS**)

### Semantic Colors — Dark (`.dark`)

| Token | Value |
| ----- | ----- |
| `--background` | `#08090D` |
| `--foreground` | `#E7E3DA` |
| `--card` | `#0E1018` |
| `--card-foreground` | `#E7E3DA` |
| `--primary` | `#D85B2A` |
| `--primary-foreground` | `#14171A` |
| `--secondary` | `#171A22` |
| `--secondary-foreground` | `#E7E3DA` |
| `--muted` | `#141720` |
| `--muted-foreground` | `#9A9690` |
| `--accent` | `#2A1A14` |
| `--accent-foreground` | `#F0A17F` |
| `--destructive` | `#E5484D` |
| `--border` | `#1D2030` |
| `--input` | `#272B35` |
| `--ring` | `#D85B2A` |

**Defined in CSS comment:** Dark primary is bright enough that **dark text** on primary controls is intentional (`--primary-foreground: #14171A`).

**Source discrepancy:** `brand-verification.html` dark mock primary button uses `color:#FFFFFF` on `#D85B2A`. Implementation prefers `#14171A` on primary in dark mode. Treat **globals.css** as product implementation; treat verification HTML as brand QA — reconcile before changing either.

### Application surface tokens (`@theme` block)

These exist alongside shadcn tokens:

| Token | Value | Notes |
| ----- | ----- | ----- |
| `--color-ground` | `#08090d` | **Defined in CSS** |
| `--color-surface` | `#0e1018` | |
| `--color-surface-2` | `#141720` | |
| `--color-border` | `#1d2030` | Overridden in `@theme inline` by `--color-border: var(--border)` |
| `--color-ivory` | `#e7e3da` | |
| `--color-ivory-dim` | `#9a9690` | |

**Gap:** Raw `body` rule sets `background: var(--color-ground)` and `color: var(--color-ivory)` while `@layer base` applies `bg-background text-foreground`. Cascade/layer order determines what users see — verify in browser when theming.

### Text Colors

Use semantic `foreground`, `muted-foreground`, `secondary-foreground`, `accent-foreground` per theme.

**Brand reference neutrals:** ink `#14171A`, charcoal `#383C41`, verification body grays `#5b5f64`, `#8a8d90`.

### Surface Colors

Light paper `#F7F6F2`; dark ground `#08090D` / cards `#0E1018` — see tables above.

### Border Colors

Light `#DEDBD2`; dark `#1D2030`. Marketing page sometimes uses `--color-border` from `@theme` (dark border) on a dark landing — **Observed** inline styles in `app/(marketing)/page.tsx`.

---

## Typography

### Font Families

| Role | CSS variable | Stack | Source |
| ---- | ------------ | ----- | ------ |
| Display | `--font-display` | `'Fraunces', Georgia, serif` | Google Fonts import in `globals.css` |
| Sans / UI | `--font-sans` | `'DM Sans', sans-serif` | `globals.css` |
| Mono | `--font-mono` | `'JetBrains Mono', monospace` | `globals.css` |
| Serif (shadcn) | `--font-serif` | Set via Next font in `app/layout.tsx` | Merriweather → `--font-serif` |
| Geist (loaded) | `--font-geist-sans`, `--font-geist-mono` | Next font in layouts | **Observed** in `app/layout.tsx`, `app/(marketing)/layout.tsx` |

**Fraunces weights imported:** 300, 400, 600, 700 (+ italics). **DM Sans:** 300, 400, 500. **JetBrains Mono:** 400, 500.

**Source discrepancy — typography:**

1. `globals.css` sets `body { font-family: var(--font-sans); }` but `html { @apply font-serif; }` in `@layer base` — default element font may be serif unless components set sans.
2. `app/layout.tsx` loads **Geist** and **Merriweather**; marketing layout loads **Geist** only — neither loads Fraunces/DM Sans via Next (those come from CSS `@import`).
3. Logo wordmark is **Poppins** outlined in SVG only (`brand-verification.html`) — not a UI font.


### Font Sizes

**Gap:** No global type scale tokens in CSS. **Observed:** Marketing page and verification HTML use ad hoc sizes (e.g. verification masthead `26px`, section labels `12px`).

### Font Weights

Fraunces and DM Sans weights as imported; button component uses `font-medium` (**Observed**).

### Line Heights

**Observed:** Marketing body copy often `lineHeight: 1.7` inline.

### Letter Spacing

**Observed:** Section labels `letterSpacing: '0.15em'` with mono uppercase.

---

## Spacing

**Guidance:** No formal spacing token file. Use Tailwind spacing utilities consistently within a section.

**Observed:** Verification board padding `72px 56px`; panel padding `56px`; marketing sections use custom padding in component styles.

---

## Layout

**Gap:** No documented global `container` max-width token in `globals.css`.

**Observed:** `brand-verification.html` `.board { max-width: 1180px; }`.

---

## Container Widths

**Open decision:** Standard app container width(s). Verification uses **1180px** for the asset board only.

---

## Borders

**Defined in CSS:** `--border` per theme; base layer `* { @apply border-border outline-ring/50; }`.

**Observed:** 1px borders throughout verification mock UI.

---

## Radius

| Token | Computation | Base |
| ----- | ----------- | ---- |
| `--radius` | `0.625rem` (10px) | `:root` |
| `--radius-sm` | `calc(var(--radius) * 0.6)` | `@theme inline` |
| `--radius-md` | `calc(var(--radius) * 0.8)` | |
| `--radius-lg` | `var(--radius)` | |
| `--radius-xl` | `calc(var(--radius) * 1.4)` | |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` | |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` | |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` | |

**Observed:** shadcn `Button` uses `rounded-4xl` (very rounded). Verification mock buttons use `border-radius: 6px`.

**Gap:** Product radius philosophy not unified between marketing mocks and shadcn defaults.

---

## Shadows

**Gap:** No custom shadow tokens in `globals.css`. shadcn components may use default shadows — not documented here.

**Design direction:** Prefer minimal shadow use.

---

## Buttons

**Observed implementation:** `components/ui/button.tsx` (shadcn + Base UI)

- Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- Default: `bg-primary text-primary-foreground hover:bg-primary/80`
- Focus: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30`
- Shape: `rounded-4xl`, heights `h-9` default, etc.

**Brand reference:** 6px radius, light primary `#B44822`, dark primary `#D85B2A`, secondary outlined — illustrative in verification HTML only.

---

## Inputs

**Defined in CSS:** `--input` border/surface color per theme; ring uses `--ring`.

**Gap:** No global input component styles documented beyond shadcn tokens.

---

## Cards

Semantic `--card` / `--card-foreground` per theme.

**Guidance:** Do not wrap every block in a card; use containment when hierarchy requires it (`design-direction.md`).

---

## Links

**Observed:** Button `link` variant — `text-primary underline-offset-4 hover:underline`.

---

## Focus States

**Defined in CSS:** `outline-ring/50` on all elements in base layer.

**Observed on Button:** `focus-visible:ring-3 focus-visible:ring-ring/30` plus border.

**Gap:** No documented global `:focus-visible` style outside shadcn patterns.

---

## Selection

**Defined in CSS:**

```css
::selection {
  background: var(--brand-primary);
  color: var(--primary-foreground);
}
```

Uses theme-appropriate brand primary via `--brand-primary` on `:root` / `.dark`.

---

## Motion

**Defined in CSS:** `@import "tw-animate-css";` — utility animations available.

**Observed:** Marketing `useFadeIn` — 0.8s ease, `translateY(18px)`.

**Gap:** No global `@media (prefers-reduced-motion)` overrides in `globals.css`.

---

## Responsive Breakpoints

**Not defined** as CSS variables.

| Context | Breakpoint | Source |
| ------- | ---------- | ------ |
| Brand verification | `820px` | `brand-verification.html` |
| Marketing page | `900px`, `560px` | `app/(marketing)/page.tsx` |
| Design review | 375px, 768px, 1280px+ | `AGENTS.md` (QA targets) |

---

## Dark Mode

**Defined in CSS:** `@custom-variant dark (&:is(.dark *));` — class `.dark` on ancestor (typically `html`).

Toggle implementation: **Gap** — not documented in globals; must be set in app code.

Default semantic theme in `:root` is **light**; body also references dark `ground`/`ivory` in a non-layer rule — verify active theme in running app.

---

## Accessibility

**Expected (AGENTS.md / design workflow):**

- Semantic HTML, labels, keyboard nav, visible focus, contrast, reduced motion

**Implemented (partial):**

- Focus-visible on buttons (**Observed**)
- `cursor: pointer` on buttons (**Defined in CSS** base layer)
- Color pairs documented above should be checked for contrast per use (especially `#D85B2A` on `#14171A` text)

**Gap:** No audit record in repo; marketing motion does not check `prefers-reduced-motion`.

---

## Component Principles

- Prefer Server Components; client only when needed (`AGENTS.md`)
- Use shadcn/ui with semantic tokens — avoid hard-coded hex in new work where tokens exist
- Unique descriptive IDs on interactive elements when required by project

---

## Implementation Rules

**Rule:** Use `#B44822` (light) and `#D85B2A` (dark) via `--primary` / `--brand-primary` — do not introduce new oranges without brand decision.

**Rule:** Logos from `public/brand/` — do not inline alternate geometry.

**Guidance:** Prefer `bg-background`, `text-foreground`, `border-border`, `bg-primary` over raw hex in new components.

**Guidance:** When adding styles, resolve font stack conflicts intentionally (see Typography discrepancies).

---

## Known Exceptions

| Location | Issue |
| -------- | ----- |
| `app/(marketing)/page.tsx` CommitMotif | Uses `rgba(201, 168, 76, …)` — legacy gold, not `#B44822` |
| `app/(marketing)/page.tsx` | Hard-coded hex grays (e.g. `#5a5750`, `#232220`) alongside CSS variables |
| `brand-verification.html` vs `globals.css` | Dark primary button text white in mock vs `#14171A` in CSS |
| `body` in `globals.css` | `color-ground` / `ivory` vs `@layer base` `background` / `foreground` |
| Duplicate layouts | `app/layout.tsx` vs `app/(marketing)/layout.tsx` with different font variables |

---

## Open Decisions

- Canonical layout font loading (Fraunces/DM Sans vs Geist/Merriweather)
- Default color mode for marketing vs app shell
- Standard border radius for marketing vs shadcn (`6px` vs `rounded-4xl`)
- Global `prefers-reduced-motion` policy
- Formal spacing and container tokens

---

## Source Files

| File | Role |
| ---- | ---- |
| `app/globals.css` | Tokens, themes, base styles |
| `public/brand/brand-verification.html` | Brand color names and UI verification |
| `components/ui/button.tsx` | Primary button implementation |
| `components.json` | shadcn configuration |
| `app/layout.tsx` / `app/(marketing)/layout.tsx` | Font loading |
