<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SkillTrail — Agent Instructions

You are working with a **solo developer building SkillTrail for developers**. Your job is to help build the product with strong product judgment, careful engineering, and a bias toward shipping, learning, and improving.

---

## Where Authoritative Information Lives

| What you want to know                    | Where to look                          |
| ---------------------------------------- | -------------------------------------- |
| What SkillTrail is and product decisions | `docs/product.md`                      |
| Domain concepts and invariants           | `docs/domain.md`                       |
| Architecture decisions and stack         | `docs/architecture.md`                 |
| Design principles and voice              | `docs/design.md`                       |
| Schema implementation                    | `db/schema/*.ts`, `db/relations.ts`    |
| Design tokens / CSS variables            | `app/globals.css`                      |
| Brand assets                             | `public/brand/`                        |
| Brand colors / verification              | `public/brand/brand-verification.html` |

Do not guess at product behavior, domain meaning, or design decisions. Read the relevant canonical doc first.

---

## How to Work Safely

### Before architectural changes

1. Read `docs/architecture.md`.
2. Read `docs/domain.md` for domain invariants that must not be violated.
3. Read the relevant `db/schema/*.ts` files before touching anything schema-adjacent.

### Before UI/copy tasks

1. Read `docs/design.md` for design principles, voice, and anti-patterns.
2. Read `.agents/skills/frontend-design/SKILL.md` for visual direction.
3. Read `.agents/skills/web-design-guidelines/SKILL.md` for interface quality review.

### Before product/feature decisions

1. Read `docs/product.md` for scope, principles, and what is/isn't V1.
2. Do not invent product capabilities, founder credentials, user numbers, or technical claims.

---

## Technology Stack

Next.js 16 App Router · TypeScript (strict) · Bun · Tailwind CSS v4 · shadcn/ui · Neon PostgreSQL · Drizzle ORM · Better Auth · Trigger.dev · Cloudflare R2 · Vercel AI SDK + Gemini (default) · Zod · Vitest · eslint + prettier · Vercel

Do not introduce new frameworks, backend services, CSS systems, state-management libraries, animation libraries, or infrastructure without a concrete reason and explicit approval.

---

## Next.js Rules

- Server Components by default
- Client Components only when interactivity requires them
- Server Actions or Route Handlers for mutations
- Never expose secrets or server-only credentials to client components
- `Better Auth` owns `/api/v1/auth/*` — never add a SkillTrail route under that prefix

---

## Schema and Domain Rules

**The V1 schema is implemented in `db/schema/*.ts`.** Do not modify it as part of ordinary work (landing page, UI tweaks, copy changes).

Critical domain invariants (see `docs/domain.md` for the full list):

- One active Draft per platform per Composition (unique constraint enforced in DB)
- AI proposals require explicit user acceptance — never silently apply AI output to a Draft
- A scheduled Publication has an immutable snapshot; Draft edits after scheduling do not silently change it
- Never expose social connection tokens to client code
- Content deletion is blocked while a live Publication exists in its composition tree

**If you believe a schema change is needed, stop and report it rather than making it unilaterally.**

---

## Code Quality

- Strict TypeScript; explicit types where useful
- Zod validation for all user inputs
- Small, composable components with clear naming
- Semantic HTML; accessible forms and labels
- Maintainable Tailwind classes following existing patterns
- eslint and prettier for formatting and linting

---

## Documentation Maintenance

Update canonical docs **only when the underlying durable decision or meaning changes**:

| Change                            | Update canonical docs?       |
| --------------------------------- | ---------------------------- |
| Rename a function                 | No                           |
| Refactor a service                | No                           |
| Change React component structure  | No                           |
| Change a product behavior         | Yes — `docs/product.md`      |
| Change a domain invariant         | Yes — `docs/domain.md`       |
| Change an architectural boundary  | Yes — `docs/architecture.md` |
| Change a durable design principle | Yes — `docs/design.md`       |

Do not update docs for implementation details. The code is the source of truth for how things are currently implemented.

---

## Handling Conflicts Between Docs and Code

If implementation differs from a documented durable decision:

1. Determine whether the difference is: implemented change, incomplete implementation, stale doc, or accidental deviation.
2. Do not automatically assume the documented decision is obsolete.
3. If you cannot determine confidently, flag it rather than silently choosing.
4. Do not modify code to make documentation agree with old documents.

---

## Scope Discipline

Make the smallest high-quality change that solves the requested problem. Do not:

- Redesign the entire application when asked for a section
- Introduce a design-system rewrite for a component fix
- Refactor unrelated components
- Add future-feature infrastructure without instruction
- Introduce unnecessary dependencies

---

## After Completing a Meaningful Task

Report briefly:

- **Changed:** What was changed
- **Verified:** What was actually tested or inspected (do not claim something was verified if it was not)
- **Design review:** Any important visual or UX decisions made
- **Remaining:** Any known limitations or unresolved decisions

---

## Core Principle

> SkillTrail is not a generic AI product looking for a market.
> It is a developer building a solution to a problem he personally experienced, for other developers who experience the same problem.

Build for developers. Tell the story behind the work. Listen to the people using it. Iterate from real feedback.
