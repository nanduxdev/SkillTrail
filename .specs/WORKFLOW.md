# SkillTrail — Spec-Driven Development Workflow

## Who reads this file

This file is read by any AI coding agent working in this repository — Cursor, Antigravity, or otherwise — and by the human developer alongside them. You (the agent) have direct access to the docs, the schema, and the code, so this file does not ask you to loop in an outside assistant for anything. It defines a protocol you follow on your own, using what's already in this checkout.

Read this file in full before starting or resuming work on any feature or bugfix. Do not skip steps.

---

## Document authority (read in this order before writing anything)

1. `docs/product.md` — what SkillTrail is, V1 scope
2. `docs/domain.md` — domain concepts + numbered invariants (`INVARIANT-*`)
3. `docs/architecture.md` — stack, system boundaries, sync-vs-background rules
4. `docs/design.md` — visual/brand direction (UI work only)
5. `docs/drizzle-relations.md`, `docs/drizzle v0-v1 changes.md`, `docs/better-auth drizzle.md` — Drizzle / Better Auth reference material
6. **Schema source of truth** — `db/schema/*.ts` + `db/relations.ts`. — they're what the database actually runs. Do not assume a schema detail exists just because it would be convenient; if it isn't in these files, it's not there.

Never invent tables, columns, indexes, routes, or config not present in the above. If something needed for a spec isn't in the repo, say so explicitly in the relevant spec file rather than guessing.

## Fact / Inference / Recommendation / Unknown

Every spec file (`requirements.md`, `analysis.md`, `design.md`) labels its claims:

- **FACT** — stated directly in one of the docs above, or directly observable in the code/schema.
- **INFERENCE** — logically follows from stated facts.
- **RECOMMENDATION** — your proposed approach; open to challenge, not binding until acted on.
- **UNKNOWN** — not established anywhere in the repo. Ask, or flag it and proceed on the simplest reasonable assumption if the ambiguity is low-risk (see "Ambiguity" below).

## Ambiguity rule (carried over from this project's engineering principles)

- **Low-risk implementation ambiguity** (naming, file layout, minor UX detail): pick the simplest reasonable interpretation, state the assumption inline, keep going.
- **Ambiguity touching domain behavior, security, database structure, publication behavior, AI review semantics, or architecture**: stop. Write it into `analysis.md` under "Ambiguities requiring a decision" and wait for the developer, rather than assuming.

---

## Where specs live

All spec artifacts and this protocol file live under `.specs/` at the repo root. Product and domain authority stay in `docs/` (see Document authority above). The human playbook for driving the protocol is `docs/spec-driven-guide.md` — it is not moved here.

```
.specs/
  WORKFLOW.md          ← this file (agent protocol)
  features/
    <feature-slug>/
      requirements.md
      analysis.md
      design.md
      tasks.md
  bugfixes/
    <bug-slug>/
      analysis.md
      tasks.md
```

`<slug>` is kebab-case, e.g. `linkedin-draft-generation`, `x-thread-reorder`, `snapshot-diff-warning-fix`. Create the folder if it doesn't exist yet.

---

## The protocol — six steps

Do not begin implementation code until the gate for the relevant step says you may.

### Step 1 — `requirements.md` in EARS syntax

**Trigger:** a new feature or change is requested and no `.specs/features/<slug>/` folder exists (create it under `.specs/` as above).

For every requirement:

1. Write it in EARS form: `WHEN <trigger/condition> THEN the system SHALL <behavior>`. Add `SHALL NOT` and/or `SHALL CONTINUE TO` clauses where relevant.
2. Underneath it, add: `Consistent with: <domain.md invariant id(s), or "no directly related invariant">`. Actually check — don't just assert consistency, verify it against the current text of `domain.md`.
3. If satisfying the requirement as written needs a column, table, index, or constraint that isn't in the schema source of truth (see Document Authority §6), add: `⚠ SCHEMA IMPACT — see design.md §Schema Impact`. Do not silently assume the schema already supports it.

```markdown
# Requirements — <feature-slug>

workflow: requirements-first | design-first
status: draft

## R1 — <short title>

WHEN <condition>
THEN the system SHALL <behavior>
[AND SHALL NOT <behavior>]

Consistent with: INVARIANT-AI-003
Schema impact: none | ⚠ see design.md
```

**Gate:** move to Step 2 once every requirement has an EARS clause and a consistency line.

### Step 2 — Analyze Requirements

**Trigger:** `requirements.md` exists with `status: draft`.

Read `requirements.md` against `docs/domain.md` and `docs/architecture.md` in full — not just the sections a requirement points to — and produce `analysis.md`:

- **Contradictions**: a requirement that conflicts with a stated invariant or an architectural boundary (e.g. business logic proposed inside a UI component or duplicated between a Server Action and a Trigger.dev task, which `architecture.md`'s domain layer rule forbids).
- **Gaps**: something the requirements imply but don't state — an ownership check, an error path, a retry behavior, an auth boundary.
- **Ambiguities requiring a decision**: per the Ambiguity rule above.

```markdown
# Analysis — <feature-slug>

## Contradictions

- R3 conflicts with INVARIANT-AI-004 because ...

## Gaps

- R2 doesn't specify the 404-vs-403 ownership behavior required by
  "Resource access must enforce ownership" (domain.md).

## Ambiguities requiring a decision

- ...

## Resolution

- [ ] closed by editing requirements.md directly
- [ ] escalated — waiting on developer
```

**Gate:** every item must be closed (resolved in `requirements.md`, or explicitly accepted as a risk by the developer) before design starts. If nothing is found, still create `analysis.md` and state that plainly — don't skip producing the file.

### Step 3 — `design.md`

**Trigger:** `analysis.md` has no open items.

```markdown
# Design — <feature-slug>

## Approach

(RECOMMENDATION)

## Files touched / created

(concrete paths — check they match what's actually in the repo before listing them)

## Domain layer placement

Where does this logic live so both Next.js request handlers and
Trigger.dev tasks can call it without duplicating logic
(architecture.md's domain layer rule)?

## Schema Impact

none
```

If Step 1 flagged a schema impact, replace `none` with:

```markdown
## Schema Impact

### Why a schema change is needed

### Affected entities

### Affected invariants

### Migration implications

### Alternatives considered (including "don't change the schema")
```

Do not fill this section in speculatively — if the honest answer is "none," say none. Schema changes are not to be recommended casually.

**Gate:** do not generate `tasks.md` until Schema Impact is `none`, or has been shown to the developer and explicitly accepted. This is the one gate in the whole protocol that requires a human, even when everything else runs autonomously.

### Step 4 — `tasks.md`

Break `design.md` into an ordered checklist. Each task should be independently completable and testable — roughly PR-sized, not commit-sized, not epic-sized.

```markdown
# Tasks — <feature-slug>

- [ ] 1. <task> — touches: <files> — tests: unit
- [ ] 2. <task> — touches: <files> — tests: unit + property (INVARIANT-...) — depends on 1
- [ ] 3. <task> — touches: <files> — tests: none (types/config only)
```

Check boxes off as work is actually completed in a session — don't leave the file stale, and don't check a box for work that wasn't actually done.

**Gate:** implementation may begin once `tasks.md` exists.

### Step 5 — Bugfix Specs → property tests

**Trigger:** a defect is reported, not a new feature.

`.specs/bugfixes/<bug-slug>/analysis.md`:

```markdown
# Bugfix — <bug-slug>

## Reproduction

Exact steps.

## Current behavior (defect)

What happens now.

## Expected behavior (EARS)

WHEN <condition> THEN the system SHALL <correct behavior>

## Must not change (regression guard, EARS)

WHEN <condition> THEN the system SHALL CONTINUE TO <existing behavior>

## Root cause

(fill in once actually found — don't guess before investigating)

## Schema impact

none | ⚠ see note
```

Then write one property test encoding both the fix and the "must not change" clause. This project locks Vitest but does not yet include a property-testing library. **The first time this step runs, ask the developer to approve adding `fast-check` (`@fast-check/vitest`) as a dev dependency — do not add it silently.** It's dev-only and doesn't touch the runtime/production surface, but it's still a new dependency and this project's rule is no dependency additions without a concrete reason and explicit approval.

```ts
import { test, expect } from "@fast-check/vitest";
import fc from "fast-check";

test.prop([/* generators for the relevant domain shape */])(
	"<bug-slug>: <property being asserted>",
	(input) => {
		// assert the fix
		// assert the "must not change" clause in the same test where practical
	},
);
```

**Gate:** the bugfix isn't done until this test exists, is confirmed to fail on the pre-fix code where feasible, and passes after the fix.

### Step 6 — Test strategy (applies to every spec, not just bugfixes)

Default to this pyramid. Do not invert it — heavy E2E coverage is expensive and slow, and this project explicitly prioritizes avoiding unnecessary complexity.

| Layer                         | Use for                                                                                 | Where                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Unit tests (majority)**     | Every domain function/service: happy path, validation errors, edge cases                | tests/unit                                            |
| **Property tests (targeted)** | Only things `domain.md` calls an invariant, or a schema-level uniqueness/ownership rule | tests/property                                        |
| **E2E (small, curated)**      | A short, fixed list of critical user journeys — not every flow                          | top-level `e2e/` (tooling not yet locked — see below) |

**Property-test candidates** (check `domain.md` for the current authoritative list — this is a starting point, not exhaustive):

- `INVARIANT-AI-003`, `-004`, `-005`, `-011`, `-013`
- One active Draft per `(composition_id, platform)`
- Ownership check returns 404, never 403, for a resource that exists but isn't owned by the caller
- `UNIQUE(platform, platform_user_id)` on social connections
- Draft edits never mutate an existing Publication snapshot
- Content deletion blocked while a live Publication exists in its composition tree

**E2E candidate journeys** (RECOMMENDATION — confirm and prune with the developer; keep this list short on purpose):

1. Create → understand → angle → draft → publish immediately (one platform)
2. AI proposal generated → accepted → reflected as current Draft state
3. Schedule → edit Draft → see "differs from scheduled" warning → replace snapshot with confirmation
4. X thread generation → reorder → publish
5. Social account disconnected before a scheduled publish time → `PUBLISH_FAILED` / `account_disconnected`

E2E tooling (Playwright is the common pairing for Next.js/Vercel) is **not** in the locked stack. Flag it as UNKNOWN/RECOMMENDATION and get explicit developer sign-off before adding it — same rule as any other new dependency.

---

## Definition of Done — feature spec

- [ ] `requirements.md` — every requirement in EARS form, consistency line present
- [ ] `analysis.md` — no open contradictions or gaps
- [ ] `design.md` — Schema Impact resolved (none, or explicitly accepted)
- [ ] `tasks.md` — all boxes checked
- [ ] Unit tests passing
- [ ] Property tests passing for any invariant touched
- [ ] `bun run typecheck && bun run lint && bun run test` reported as "should be run" or, if you actually ran them this session, reported with the real output — never claimed as passing without having run them

## Definition of Done — bugfix spec

- [ ] `analysis.md` complete, root cause filled in (not left as a guess)
- [ ] Regression property test written, confirmed to fail pre-fix where feasible, passes post-fix
- [ ] No unrelated files touched

---

## Notes for specific agents

**Cursor**: keep `.cursor/rules/spec-protocol.mdc` pointing at `.specs/WORKFLOW.md` with `alwaysApply: true`, so every chat/Plan Mode/Agent session loads it without being re-pasted. Use Plan Mode (Shift+Tab) to confirm scope before Step 4's tasks get executed — it researches the repo and proposes a plan before touching code.

**Antigravity**: this file is not auto-loaded — register it once via the Agent Panel's **⋯ → Customizations → Rules → Workspace Rules** (writes to `.agents/rules/` in this repo) so every conversation picks it up automatically. The Implementation Plan / Task List / Code Diffs / Walkthrough artifacts a normal conversation produces map onto Steps 3–4 and the verification step above — treat them as the review checkpoint for this protocol, not as a separate thing.

**Either agent**: if you're ever unsure whether a claim belongs in FACT, INFERENCE, or RECOMMENDATION, put it in RECOMMENDATION and say why. Never upgrade an UNKNOWN to a FACT because it would be convenient for the spec to be complete.
