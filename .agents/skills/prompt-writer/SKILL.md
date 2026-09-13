---
name: prompt-writer
description: Writes copy-paste-ready prompts for delegating work to AI agents and external tools. ALWAYS use when the user asks for a prompt to build, design, explain, implement, refactor, debug, review, or create something — including "give me a prompt", "write a prompt for", "craft a prompt", "what should I tell the agent/cursor/chatgpt", "prompt to paste into", or wants to hand off a task to Cursor, Claude Code, ChatGPT, Copilot, v0, Bolt, Midjourney, or other AI tools. Also use when the user describes work meant for another AI even if they never say "prompt".
---

# Prompt Writer

Turn a vague goal into a prompt that gets the job done on the first try. The deliverable is always a **ready-to-paste prompt** — not advice about prompting in general.

## What you're producing

The user will copy your output into another tool or agent. That agent starts cold: it has no conversation history, no implicit context, and no shared mental model. Your prompt must carry everything the executor needs.

A strong prompt answers:
- **What** should be produced (artifact, behavior, explanation)
- **Why** it matters (so the executor can make good tradeoffs)
- **Who** it's for (audience, user, reader)
- **Constraints** (stack, style, scope, deadlines, things to avoid)
- **Done** looks like (acceptance criteria, format, examples)

## Workflow

### 1. Extract intent

From the user's message and conversation history, identify:

| Dimension | Questions |
|-----------|-----------|
| Task type | build / design / explain / debug / refactor / review / plan / research |
| Artifact | code, UI, doc, image, API, test, migration, PR description, etc. |
| Target executor | IDE agent, chat LLM, image gen, no-code AI, specialized tool |
| Context available | repo access, files, screenshots, prior decisions |
| Quality bar | MVP vs production, speed vs polish, exploratory vs definitive |

If anything material is missing, ask **at most 2–3 focused questions** in one message. Prefer inferring from context over interrogating. If the user said "just give me something", produce your best prompt with clearly labeled `[ASSUMPTION]` placeholders they can edit.

### 2. Choose target profile

Match the prompt structure to where it will run. Read [references/target-profiles.md](references/target-profiles.md) for the relevant executor before writing.

Quick routing:

| Target | Optimize for |
|--------|----------------|
| Cursor / Claude Code / Copilot | File paths, repo conventions, incremental edits, verification steps |
| ChatGPT / Claude.ai (no codebase) | Self-contained context, paste-in code blocks, explicit output format |
| v0 / Bolt / Lovable | Component scope, design tokens, responsive behavior, framework |
| Image tools (Midjourney, DALL·E, etc.) | Subject, composition, style, lighting, aspect ratio, negative prompts |
| Docs / explanation agents | Audience level, structure, depth, analogies, what to skip |

When the target is unspecified, default to **IDE coding agent** and note alternatives in a one-line "Also works for" note.

### 3. Draft the prompt

Apply patterns from [references/prompt-patterns.md](references/prompt-patterns.md). Structure by task complexity:

**Simple task** (one artifact, clear scope): Goal → Context → Requirements → Output format.

**Complex task** (multi-step, architectural): Role framing → Background → Phased deliverables → Constraints → Verification → Out of scope.

**Explanation task**: Audience → Question → Desired depth → Format → Examples to include or avoid.

Principles that matter most:
- **Front-load the goal** — first sentence states the outcome.
- **Be specific over verbose** — "Next.js App Router, server components by default" beats a paragraph about modern web dev.
- **Scope boundaries prevent drift** — explicit "do not" and "out of scope" save revision loops.
- **Actionable acceptance criteria** — "responsive at 375/768/1280" not "make it look good".
- **Preserve user voice** — if they gave exact wording, constraints, or stack choices, carry them verbatim.

### 4. Self-check before delivering

Run this mental checklist:
- Could a stranger execute this without asking clarifying questions?
- Is there exactly one primary ask (with sub-tasks ordered if needed)?
- Are constraints testable, not vibes?
- Did you include context the executor cannot infer (paths, versions, prior decisions)?
- Is the output format explicit (file names, sections, code-only, markdown table, etc.)?

### 5. Deliver

Use this output structure every time:

```markdown
## Prompt for [Target Tool]

> [The complete copy-paste prompt in a single block]

---

**Target:** [tool/agent type]
**Task type:** [build | design | explain | ...]
**Assumptions:** [bullets, or "None — fully specified from your request"]
**Tips:** [1–2 optional lines: model to use, follow-up prompts, or what to attach]
```

The prompt block must be self-contained. No "as discussed above" or "use the context from our chat."

## Variants

### Multi-prompt sequences

For large work, deliver a **prompt chain** — numbered prompts where each builds on the previous output:

```markdown
### Prompt 1 of 3 — [Phase name]
> ...

### Prompt 2 of 3 — [Phase name]
> ... (references output from Prompt 1)
```

Only split when phases have natural checkpoints (plan → implement → polish). Don't split trivial tasks.

### Prompt + context bundle

When the executor needs files or artifacts the user must attach, add a **Context to attach** section listing exactly what to paste or @-mention:

```markdown
**Context to attach:**
- `src/components/Hero.tsx` (current implementation)
- Screenshot of target design
- `package.json` (dependency versions)
```

### Explanation prompts

For "explain X" requests, calibrate depth to audience (junior dev, stakeholder, interview prep). State: starting knowledge, end state after reading, and format (prose, outline, analogy-first, FAQ).

## Anti-patterns

Avoid putting these in the delivered prompt:
- Meta-instructions ("you are an expert prompt engineer")
- Hollow superlatives ("best", "perfect", "world-class")
- Duplicate or contradictory requirements
- Assuming shared conversation history
- Unbounded scope ("and anything else you think is good")
- Technology the user didn't choose unless you label it as a suggestion outside the prompt

## Examples

See [references/examples.md](references/examples.md) for full input → output pairs across task types.

**Quick example:**

User: "give me a prompt to build a waitlist form for my landing page"

```markdown
## Prompt for Cursor Agent

> Build a founding-user waitlist form for our Next.js App Router landing page.
>
> **Goal:** Capture email (required) and optional name. Submit to our existing server action or API route pattern in this repo.
>
> **Requirements:**
> - Match existing landing page visual language (dark theme, premium feel)
> - Client form with loading, error, and success states
> - Accessible labels, focus-visible styles, semantic HTML
> - Unique `id` on every interactive element
> - Do not add new database tables or domain models beyond waitlist contact fields
>
> **Output:** Component file(s) integrated into the current hero/CTA section. Run the app and verify mobile (375px) and desktop layouts.
>
> **Out of scope:** Email provider integration, auth, admin dashboard.

---

**Target:** Cursor / IDE coding agent
**Task type:** build
**Assumptions:** Next.js App Router repo with existing landing page styles
**Tips:** @-mention the landing page component and any existing form/API patterns before sending.
```
