# SkillTrail — Your Spec-Driven Workflow Guide

This is your playbook, not the agents'. **`.specs/WORKFLOW.md`** is what Cursor and Antigravity read and follow on their own — they have the docs, the schema, and the code, so they self-check consistency without you in the loop for most steps. **This file stays in `docs/`** and is how _you_ drive that protocol from inside whichever IDE you're already in.

| Location                                             | What lives there                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `.specs/WORKFLOW.md`                                 | Agent protocol (six steps, gates, Definition of Done)                    |
| `.specs/features/<slug>/`                            | Feature specs: `requirements.md`, `analysis.md`, `design.md`, `tasks.md` |
| `.specs/bugfixes/<slug>/`                            | Bugfix specs: `analysis.md` (and tasks if you add them)                  |
| `docs/product.md`, `domain.md`, `architecture.md`, … | Product and engineering authority (unchanged)                            |
| `docs/spec-driven-guide.md`                          | This human playbook                                                      |

Assumptions: Cursor (Plan Mode), Antigravity in the **Editor view Agent Panel** — not Agent Manager / Mission Control.

---

## 0. One-time setup (~10 minutes)

Do this once per machine/repo. After this, everything below is a slash command (once you add the command files).

### Cursor

**1. Standing rule** — committed at `.cursor/rules/spec-protocol.mdc`. It should point at `.specs/WORKFLOW.md` with `alwaysApply: true`. If you clone fresh, verify the body matches:

```
Before any feature or bugfix work, read .specs/WORKFLOW.md in full and follow it.
Don't skip steps or invent schema/routes/config not present in db/schema/*.ts,
db/relations.ts, or provided context. Respect domain invariants in docs/domain.md.
```

`alwaysApply: true` loads the protocol in every chat, Plan Mode session, and Agent run — you don't re-paste it.

**2. Slash commands** — create `.cursor/commands/` and add these six files. Typing `/` in chat surfaces them.

`.cursor/commands/spec-requirements.md`

```
Follow Step 1 of .specs/WORKFLOW.md.
If I haven't given you a feature slug and one-paragraph description in
this message, ask for both before doing anything else.
Create .specs/features/<slug>/requirements.md in EARS syntax,
cross-checked against docs/domain.md and docs/architecture.md, with a
"Consistent with:" line per requirement and schema-impact flags where
relevant.
```

`.cursor/commands/spec-analyze.md`

```
Follow Step 2 of .specs/WORKFLOW.md for the feature slug I give you.
Read .specs/features/<slug>/requirements.md fully against
docs/domain.md and docs/architecture.md. Produce
.specs/features/<slug>/analysis.md listing contradictions, gaps,
and ambiguities. Do not proceed to design in this same reply.
```

`.cursor/commands/spec-design.md`

```
Follow Step 3 of .specs/WORKFLOW.md for the feature slug I give you.
Confirm analysis.md has no open items first — if it does, stop and
tell me what's open instead of proceeding.
Then write .specs/features/<slug>/design.md using the
FACT/INFERENCE/RECOMMENDATION/UNKNOWN structure, including the
Schema Impact section.
```

`.cursor/commands/spec-tasks.md`

```
Follow Step 4 of .specs/WORKFLOW.md for the feature slug I give you.
Only proceed if design.md's Schema Impact is "none," or I've already
told you it's approved. Write .specs/features/<slug>/tasks.md as
an ordered, PR-sized checklist, dependencies marked inline.
```

`.cursor/commands/spec-implement.md`

```
Open .specs/features/<slug>/tasks.md. Confirm with me which
unchecked task(s) we're doing this session if there's more than one
obvious next step, implement them, write unit tests (and property
tests per Step 6 of .specs/WORKFLOW.md if the task touches an
invariant), then check the box(es) off in tasks.md.
```

`.cursor/commands/spec-bugfix.md`

```
Follow Step 5 of .specs/WORKFLOW.md. Ask me for reproduction steps if I
haven't given them. Create .specs/bugfixes/<slug>/analysis.md,
investigate the root cause before filling that section in, then write
a fast-check property test encoding both the fix and the "must not
change" clause. If fast-check isn't a project dependency yet, ask me
before adding it.
```

Optional: `.cursor/commands/spec-test-audit.md`

```
For the feature slug I give you, review the tests written against
Step 6 of .specs/WORKFLOW.md's pyramid: is unit coverage adequate, are
the right things property-tested, and is anything an unnecessary E2E
test that duplicates unit/property coverage? Report gaps, don't fix
them yet.
```

**3. Usage** — one chat, no tab switching:

```
/spec-requirements   linkedin-draft-generation: platform-specific draft from an accepted angle
/spec-analyze         linkedin-draft-generation
/spec-design          linkedin-draft-generation
/spec-tasks           linkedin-draft-generation
/spec-implement       linkedin-draft-generation
```

Use **Plan Mode** (`Shift+Tab`) before `/spec-implement` when a task touches more than one or two files.

---

### Antigravity (Editor view, no Agent Manager)

Antigravity doesn't auto-load a protocol file the way Cursor's `alwaysApply` rule does — register it explicitly, once.

**1. Add the workspace rule**

- Open the Agent Panel → click **⋯** (top-right) → **Customizations**.
- Under **Rules → Workspace Rules**, add a new rule (this writes into `.agents/rules/` in the repo):
  - Name: `spec-protocol`
  - Body:

```
Before any feature or bugfix work, read .specs/WORKFLOW.md in full and
follow it. Don't skip steps or invent schema/routes/config not present in
db/schema/*.ts, db/relations.ts, or provided context. Respect domain
invariants in docs/domain.md.
```

This now applies to every conversation in this project automatically — same effect as Cursor's rule file.

**2. Add the Workflows** (Antigravity's equivalent of Cursor's slash commands)

- Still in **Customizations**, go to **Workflows** and add one per step. Reuse the exact same six prompt bodies from the Cursor section above — they're plain text and not Cursor-specific. Name them the same (`spec-requirements`, `spec-analyze`, `spec-design`, `spec-tasks`, `spec-implement`, `spec-bugfix`).

**3. Usage** — single running conversation in the Editor's Agent Panel:

```
/spec-requirements   linkedin-draft-generation: platform-specific draft from an accepted angle
/spec-analyze         linkedin-draft-generation
/spec-design          linkedin-draft-generation
/spec-tasks           linkedin-draft-generation
/spec-implement       linkedin-draft-generation
```

Use **Planning mode** over Fast mode for anything spanning multiple files — same reasoning as Cursor's Plan Mode. Even without Agent Manager, each message still produces the Implementation Plan / Task List / Code Diffs / Walkthrough artifacts (the icon row above the input: Changes Overview, Terminal, Artifacts, Browser) — use those, not a second window, as your review point before accepting changes. For UI-facing work, let it drive the browser and produce a Walkthrough; that's stronger verification evidence than a chat claim.

---

## 1. Where you're in the loop

`.specs/WORKFLOW.md` lets the agent cross-check `docs/domain.md` and `docs/architecture.md` without you. You step in for:

1. **Schema Impact ≠ none** (Step 3 — human must accept before `tasks.md`).
2. **Escalated ambiguities** (domain, security, DB, publication, AI review, architecture).
3. **New dependencies** — `fast-check` for bugfix property tests; E2E tooling when proposed.

Everything else (EARS requirements, analysis, design, tasks, unit/property tests) runs against the same repo docs the agent already has.

## 2. Quick reference — the six steps

| #          | Path under `.specs/`                          | What you check                       |
| ---------- | --------------------------------------------- | ------------------------------------ |
| 1          | `features/<slug>/requirements.md`             | EARS clauses read right              |
| 2          | `features/<slug>/analysis.md`                 | Answer escalated ambiguities         |
| 3          | `features/<slug>/design.md`                   | Schema Impact — approve or push back |
| 4          | `features/<slug>/tasks.md`                    | Sizing and order                     |
| 5 (bugfix) | `bugfixes/<slug>/analysis.md` + property test | Root cause is real                   |
| 6          | `tests/` in repo                              | Pyramid — not E2E-heavy              |

## 3. Bugfix cheat sheet

Don't start with `/spec-requirements` for defects:

```
[Cursor] Debug or "why is X happening" to find root cause first
/spec-bugfix   <bug-slug>: <one-line description + repro>
```

Confirm the property test fails on current code before the fix.

## 4. Definition of done, at a glance

**Feature:** requirements → analysis clean → schema impact resolved → tasks checked → unit + property tests → `bun run typecheck && bun run lint && bun run test` green.

**Bugfix:** analysis with real root cause → regression property test fails pre-fix → fix → passes → no unrelated files.

## 5. One thing to watch for

Skim `analysis.md` even when it says no contradictions — a shallow Step 2 poisons design and implementation downstream.
