# Target Profiles

Adapt prompt structure to the executor. Read the section that matches the user's target before drafting.

## IDE agents (Cursor, Claude Code, Windsurf, Copilot)

These agents have tool access: file read/write, terminal, search, browser.

**Include:**
- Exact file paths to read or modify (`src/app/page.tsx`, `db/schema.ts`)
- Instruction to read surrounding code before editing
- Stack and conventions ("match existing patterns in `components/ui/`")
- Verification steps ("run `bun test`, start dev server, check 375px width")
- Scope limits ("only touch files in `src/components/landing/`")

**Avoid:**
- Pasting entire files when `@file` references work
- Generic "follow best practices" without project-specific anchors

**Tone:** Direct imperative. "Add", "Refactor", "Fix" — not "Could you please consider."

## Chat LLMs without codebase (ChatGPT, Claude.ai, Gemini)

No file system. Everything must be inline or pasted.

**Include:**
- Full relevant code in fenced blocks
- Versions (`React 19`, `Python 3.12`, `PostgreSQL 16`)
- Explicit output format ("return only the modified function", "markdown with H2 sections")
- "If information is missing, state assumptions before answering"

**Avoid:**
- "@mention" syntax or "read the repo"
- Multi-file edits without showing current file contents

## UI builders (v0, Bolt, Lovable, Galileo)

Generate components or full pages from description.

**Include:**
- Framework (`React`, `Next.js`, `Tailwind`)
- Component boundary (single component vs full page)
- Design tokens if known (colors, fonts, radius, spacing scale)
- Responsive breakpoints and interaction states
- Data shape for dynamic content (props, mock data)
- Reference screenshots or URLs when mimicking a style

**Avoid:**
- Backend logic, auth, database — unless the tool supports it
- Vague aesthetic words without concrete direction ("modern", "clean")

## Image generation (Midjourney, DALL·E, Ideogram, Flux)

**Include:**
- Subject and action (what, who, doing what)
- Composition (close-up, wide, isometric, rule of thirds)
- Style reference (photography, illustration, 3D render, era/movement)
- Lighting and mood
- Color palette
- Aspect ratio / dimensions
- Negative prompt line when the tool supports it (text, watermarks, blurry)

**Avoid:**
- Copyrighted character names unless user owns the IP
- Contradictory style cues ("minimalist" + "extremely detailed ornate")

## Documentation / writing agents

**Include:**
- Audience and their starting knowledge
- Document type (README, ADR, tutorial, API reference, blog post)
- Tone (technical, executive, casual)
- Length target (one paragraph, 800 words, comprehensive)
- Required sections or template
- Sources to ground in (specs, code, meeting notes)

## Research / analysis agents

**Include:**
- Research question (single sharp question beats ten vague ones)
- Decision the output supports
- Sources to prefer or exclude
- Output structure (pros/cons table, recommendation, ranked list)
- Confidence calibration ("cite sources", "flag uncertainty")

## Automation / API agents (n8n AI, Zapier, custom pipelines)

**Include:**
- Input schema and example payload
- Output schema
- Error handling expectations
- Idempotency and side effects
- Rate limits or cost constraints
