# Examples

Full input → output pairs. The delivered prompt block is what the user copies.

---

## Example 1: Build (IDE agent)

**User:** "prompt to add dark mode toggle to my next app"

**Output:**

## Prompt for Cursor Agent

> Add a dark/light mode toggle to this Next.js App Router project.
>
> **Goal:** Users can switch themes; preference persists across sessions.
>
> **Requirements:**
> - Use `next-themes` if not already installed; follow existing Tailwind dark: variant usage
> - Toggle in the site header; keyboard accessible with visible focus ring
> - Respect `prefers-color-scheme` before user overrides
> - No flash of wrong theme on load (suppress hydration warning if needed)
> - Match existing header component structure — read `src/components/` before adding
>
> **Verify:** Toggle works, persists on refresh, reduced-motion respected, no layout shift.
>
> **Out of scope:** Per-component theme overrides, custom color picker.

---

**Target:** Cursor / IDE coding agent  
**Assumptions:** Tailwind + App Router already configured  
**Tips:** @-mention `layout.tsx` and the header component.

---

## Example 2: Design (image tool)

**User:** "give me a midjourney prompt for a logo, commit story app, git meets storytelling"

**Output:**

## Prompt for Midjourney

> Minimal app icon logo, abstract merge of git commit graph nodes and open book pages forming a single mark, single centered symbol on flat background, geometric with one organic curve, deep navy and electric violet accent, subtle gradient, vector-clean edges, professional SaaS brand, no text, no letters --ar 1:1 --style raw --v 6

**Negative prompt:** photorealistic, 3D render, busy details, watermark, typography, multiple icons, clipart

---

**Target:** Midjourney  
**Task type:** design  
**Assumptions:** Icon/mark only, not full wordmark  
**Tips:** Run 4 variants; pick one and use "vary strong" for refinement.

---

## Example 3: Explain (chat LLM)

**User:** "prompt to explain drizzle ORM relations to someone who knows SQL but not drizzle"

**Output:**

## Prompt for Claude / ChatGPT

> Explain Drizzle ORM relations to a developer who is comfortable with SQL and foreign keys but has never used Drizzle.
>
> **After reading, they should be able to:** Define one-to-many and many-to-many in Drizzle schema, write a query that joins related tables, and understand how Drizzle's relation API differs from raw SQL joins.
>
> **Format:** Short intro, then side-by-side SQL mental model ↔ Drizzle code for each relation type, one complete mini example (users + posts), common mistakes section.
>
> **Use:** TypeScript examples with `drizzle-orm/pg-core`. Drizzle version ~0.30+.
>
> **Skip:** Installation, migration CLI, comparing to Prisma unless one paragraph on "when to pick which."

---

**Target:** Chat LLM (no codebase)  
**Task type:** explain

---

## Example 4: External UI tool

**User:** "v0 prompt for a pricing section, 3 tiers, founding user highlight"

**Output:**

## Prompt for v0

> Create a responsive pricing section component for a SaaS landing page (React + Tailwind).
>
> **Layout:** Three tiers — Starter, Pro, Founding (center, highlighted). Desktop: 3 columns; mobile: stacked cards.
>
> **Founding tier:** "Most popular" badge, distinct border/glow, CTA "Join waitlist" (primary); other tiers secondary CTA.
>
> **Each card:** Plan name, price (monthly), 4–5 feature bullets, CTA button.
>
> **Style:** Dark background (#0a0a0f), cards with subtle border, violet accent on founding tier, generous padding, rounded-xl.
>
> **States:** Hover lift on cards; focus-visible on buttons.
>
> **Props:** Accept `plans` array `{ name, price, features, highlighted, ctaLabel }` for easy data swap.

---

**Target:** v0  
**Task type:** design / build

---

## Example 5: Multi-prompt chain

**User:** "prompts to migrate our auth from next-auth to better-auth, big change"

**Output:**

### Prompt 1 of 3 — Audit and plan

> Audit this Next.js project's current next-auth setup and produce a migration plan to better-auth.
>
> Read: auth config, API routes, middleware, session usage in server components and client hooks.
>
> **Deliver:** Markdown plan with — current flow diagram (mermaid), file-by-file change list, breaking risks, rollback strategy, ordered migration steps. Do not change code yet.

### Prompt 2 of 3 — Implement core auth

> Implement better-auth using the approved migration plan (attached below).
>
> **This phase:** Core provider setup, session handling, middleware, login/logout routes. Preserve existing user table shape where possible.
>
> **Verify:** Login, logout, protected route, session in RSC. Run existing auth tests.
>
> [Paste plan from Prompt 1]

### Prompt 3 of 3 — Cleanup and verify

> Complete the better-auth migration: remove next-auth dependencies, delete dead files, update env example, fix any remaining imports.
>
> **Deliver:** Summary of deleted/added files, env vars needed, manual QA checklist.

---

**Target:** Cursor / IDE coding agent  
**Task type:** build (phased)  
**Tips:** Attach migration plan between phases; commit after each prompt.
