# Prompt Patterns

Reusable structures. Pick one base pattern, then layer constraints and acceptance criteria.

## The CORE pattern (default)

```
**Goal:** [one sentence — the outcome]
**Context:** [what exists, what's broken, who's affected]
**Requirements:** [numbered, testable]
**Output:** [format, files, structure]
**Out of scope:** [explicit exclusions]
```

Works for 80% of build and fix tasks.

## Role + mission (complex or ambiguous work)

```
You are [specific role with domain, not "expert"].

**Mission:** [outcome]
**Background:** [facts the executor needs]
**Approach:** [phases or ordered steps]
**Constraints:** [hard limits]
**Success criteria:** [how to know it's done]
```

Use when tradeoffs matter and the executor must prioritize. The role should narrow domain ("senior TypeScript engineer on a Next.js product") not inflate capability ("world-class genius").

## Spec-style (design / product / API)

```
## Overview
[2–3 sentences]

## User story
As [user], I want [action] so that [benefit].

## Functional requirements
1. ...

## Non-functional requirements
- Performance: ...
- Accessibility: ...

## Edge cases
- ...

## Open questions
- [only if user wants executor to decide — otherwise resolve yourself]
```

## Explanation / teaching

```
Explain [topic] for [audience with starting knowledge].

**After reading, they should be able to:** [concrete capability]
**Depth:** [overview | working knowledge | expert reference]
**Format:** [prose | outline | Q&A | analogy-first]
**Include:** [examples, diagrams description, code snippets]
**Skip:** [prerequisites they already know, tangents]
```

## Review / audit

```
Review [artifact] for [criteria].

**Focus areas:** [security | performance | accessibility | style | correctness]
**Context:** [what this code/docs does in the system]
**Output format:**
- Critical issues (must fix)
- Suggestions (should consider)
- Nice-to-haves
For each: location, issue, recommended fix.
```

## Refactor

```
Refactor [target] to achieve [goal].

**Current pain:** [specific problem]
**Constraints:** [no behavior change | API must stay stable | etc.]
**Patterns to follow:** [point to examples in codebase or named pattern]
**Do not:** [rewrite unrelated code, change public API, etc.]
**Verify:** [tests, types, manual checks]
```

## Debug

```
**Symptom:** [what happens]
**Expected:** [what should happen]
**Reproduction:** [steps or environment]
**Already tried:** [rules out wasted loops]
**Relevant code/logs:** [inline or paths]
**Fix goal:** [minimal fix | root cause + fix]
```

## Anti-patterns in prompts

| Weak | Strong |
|------|--------|
| "Make it better" | "Reduce LCP below 2.5s on mobile; lazy-load hero image" |
| "Best practices" | "Server components by default; colocate data fetching in page.tsx" |
| "Clean code" | "Extract validation into `lib/validate-email.ts`; no function over 40 lines" |
| "Nice UI" | "Dark theme, 8px spacing grid, hover + focus-visible on all interactives" |
| Long backstory | 3–5 sentences of context max; link or attach the rest |
| Multiple competing goals | One primary goal; secondary goals labeled optional |

## Calibration knobs

Adjust these based on user intent:

| Knob | Low | High |
|------|-----|------|
| Autonomy | "Ask before making architectural decisions" | "Make reasonable choices; document assumptions" |
| Verbosity | "Code only, no explanation" | "Explain each step as you go" |
| Risk | "Minimal diff, safest change" | "Okay to restructure if justified" |
| Exploration | "Single recommended approach" | "Propose 2–3 options with tradeoffs" |

Default to **moderate autonomy**, **show work for complex tasks**, **minimal diff for fixes**.
