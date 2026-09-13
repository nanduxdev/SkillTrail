<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SkillTrail — Agent Instructions

Welcome to the SkillTrail project.

You are working with a **solo developer building SkillTrail for developers**.

Your primary responsibility is to help build the product with strong product judgment, distinctive design, careful engineering, and a bias toward shipping, learning, and improving.

---

# 1. Product Identity

## What is SkillTrail?

SkillTrail exists because of a problem I experienced myself:

> **I know how to build things. I struggled to turn the things I build into stories, a personal brand, and a consistent presence on social media.**

Building software and communicating the value of that work are two different skills.

A developer can spend days or weeks building something meaningful and still struggle with:

* figuring out what is actually worth sharing
* turning technical work into an interesting story
* finding the right angle
* explaining technical work at the right depth
* maintaining a consistent voice
* knowing what to post
* posting consistently
* building a recognizable presence over time
* turning scattered development work into a coherent personal brand

**SkillTrail is being built to solve that problem.**

It is a product **built by a developer for developers**.

The goal is not to turn developers into full-time content creators.

The goal is to help developers **turn the work they are already doing into stories worth sharing** and build a stronger presence around the things they actually build, learn, discover, and care about.

---

# 2. Founder Story Is Part of the Product

SkillTrail is being built by **one solo developer**.

Do not present SkillTrail as if it is being built by:

* a large startup team
* a marketing company
* an agency
* a social-media company
* a corporate product team

Use **"I"** when referring to the person building SkillTrail.

Do not casually replace "I" with "we."

Avoid phrases such as:

* "our team"
* "our team of experts"
* "we're building"
* "the team"
* "our mission"

unless the user explicitly asks for that language.

The solo-founder context is not something to hide.

It is part of the product's identity:

> **One developer building for developers, from a problem he experienced himself.**

This should influence the tone, copy, UI, and storytelling throughout the product.

---

# 3. Why SkillTrail Is Being Built

The canonical product story is:

> **I’m building this because I needed it too.**
>
> I’m a developer who knows how to build things, but struggled to turn that work into stories, a personal brand, and a consistent presence on social media. SkillTrail started with that problem.
>
> Now I’m building it for developers who have the same problem — one iteration at a time, based on what actually helps.

This is not merely landing-page copy.

Treat it as **product context**.

Whenever you design or write an experience, understand the underlying narrative:

**Developer does meaningful work**
↓
**Developer struggles to communicate it**
↓
**SkillTrail helps find the story**
↓
**Developer creates content**
↓
**Developer shares it**
↓
**Developer builds a recognizable presence**
↓
**Real users provide feedback**
↓
**SkillTrail improves through iteration**

---

# 4. Founding Users

The purpose of the founding-user program is **not simply to collect email addresses**.

The purpose is to find a small group of developers who experience the same problem and are willing to help shape the product.

Founding users should be communicated as:

> **early developers helping shape a product they actually need.**

The feedback loop is fundamental:

**Build → release → listen → learn → iterate → improve**

The founder wants real feedback from real developers.

Therefore, whenever appropriate, communicate that joining early means:

* getting early access
* trying the product while it is still evolving
* sharing what works
* sharing what does not work
* identifying missing capabilities
* influencing what gets built next

Do not exaggerate this into a large startup-style "community" unless explicitly decided.

The product is being built **one iteration at a time**.

---

# 5. Current Project Phase

## "Coming Soon" Landing Page

The current phase is a **Coming Soon landing page** focused on:

1. communicating the problem
2. explaining why SkillTrail exists
3. showing how the product intends to solve that problem
4. establishing a distinctive product identity
5. building trust through the founder story
6. capturing founding-user signups
7. learning from early users

The landing page should not feel like a generic feature catalogue.

It should tell a story.

A visitor should understand:

> **"This developer had the same problem I have. He is building something specifically to solve it, and I can help shape it early."**

---

# 6. Product Messaging Principle

## Story before feature list

Do not begin with abstract product language such as:

> "SkillTrail is an AI-powered social media platform for developers."

Prefer concrete human context:

> "I built software. I struggled to talk about it."

Then explain the product.

The product's features should support the story rather than replace it.

For example:

### Weak

> AI-Assisted Content Creation

> Generate high-quality social media posts with AI.

### Better

> **You already did the work.**
>
> SkillTrail helps turn that work into a story worth sharing.

The second version communicates the user's problem before describing the technology.

---

# 7. Product Capabilities

The landing page may communicate the following V1 capabilities, but they must be presented through the context of the developer's problem.

### AI-Assisted Content Creation

Turn raw ideas, research, discoveries, and development work into engaging posts with customized:

* tone
* technical depth
* emoji usage
* writing preferences

### Multi-Platform Publishing

Draft, schedule, and publish content to:

* LinkedIn
* X

Including X:

* standalone posts
* replies
* self-replies
* generated threads
* quotes of the user's own post

### Personalization

Help developers maintain consistency through:

* technologies
* interests
* writing preferences
* optional free-form instructions

### AI Generation History

Preserve AI generation history so developers can:

* review previous generations
* compare generations
* restore previous generations
* avoid losing a good idea

### Consistency & Discovery

Help developers:

* maintain posting consistency
* discover relevant content
* stay connected to topics and technologies they care about

Do not invent additional product capabilities.

---

# 8. Design Direction

SkillTrail should have a **distinctive visual identity**, not a generic AI-SaaS aesthetic.

The design should feel appropriate for:

* developers
* builders
* technical creators
* people building in public
* people trying to develop a personal brand around their work

The visual language should emerge from the product's subject:

**code → work → thought → story → publishing → presence**

Do not use visual trends merely because they are currently popular.

---

# 9. Avoid Generic AI SaaS Design

Do not default to:

* purple AI gradients
* blue/purple SaaS gradients
* excessive glassmorphism
* floating gradient blobs
* generic dashboard mockups
* giant centered hero sections with no product meaning
* generic three-card feature grids
* excessive pill-shaped UI
* excessive rounded cards
* random decorative code snippets
* meaningless terminal windows
* "AI magic" visual effects
* generic robot/AI imagery
* stock developer imagery
* meaningless animated particles
* arbitrary glowing borders
* excessive gradients
* visual decoration without product meaning

Do not make SkillTrail look interchangeable with another AI startup.

Before accepting a design, ask:

> **Could this exact interface belong to another random AI SaaS?**

If yes, reconsider the design.

---

# 10. Design From the Developer's Reality

When designing a section, first ask what real developer problem it represents.

Examples:

### Hero

Should communicate:

> "You build things. SkillTrail helps you tell the story."

### Problem section

Should communicate:

> "Building is easier for me than talking about what I built."

### Content creation section

Should communicate:

> "The work already exists. SkillTrail helps uncover the story inside it."

### Personalization section

Should communicate:

> "Your voice should still sound like you."

### Publishing section

Should communicate:

> "Turn one piece of work into something you can consistently share."

### Founding-user CTA

Should communicate:

> "I'm building this because I needed it. If you have the same problem, help me make it better."

### Footer

Should reinforce:

> **one developer building for developers**

Do not use the same generic product pitch in every section.

---

# 11. Tone of Voice

SkillTrail should feel:

* honest
* thoughtful
* technical
* personal
* confident without pretending to be bigger than it is
* developer-native
* practical
* understated
* human

Avoid:

* startup hype
* corporate marketing language
* exaggerated promises
* fake urgency
* "revolutionary"
* "game-changing"
* "10x your personal brand"
* "dominate social media"
* "AI-powered growth machine"
* generic productivity language

The founder should sound like a developer who encountered a problem and decided to build the solution.

---

# 12. Do Not Invent Founder Claims

Never invent:

* founder credentials
* user numbers
* testimonials
* customer logos
* partnerships
* funding
* team members
* awards
* traction
* revenue
* waitlist numbers
* product capabilities

If information is not established, do not manufacture it to make the landing page appear more credible.

Use honest statements.

---

# 13. Landing Page CTA

The primary conversion goal is to recruit **Founding Users**.

The CTA should feel like an invitation to participate in the product's early development rather than a generic newsletter signup.

Good framing:

> **Build it with me.**

> **I’m building this because I needed it too.**

> **Help shape what gets built next.**

> **Be one of the first developers to try it.**

The CTA should communicate that early users can provide real feedback that influences future iterations.

Do not imply a large team.

---

# 14. Technical Stack

Use the existing project stack.

* Next.js
* App Router
* TypeScript
* Bun
* Tailwind CSS
* shadcn/ui where appropriate
* Neon PostgreSQL
* Drizzle ORM
* Better Auth
* Trigger.dev
* Cloudflare R2
* Vercel AI SDK
* Gemini as default hosted AI provider
* Zod
--  not sure about these testing technologies cause i dont have any prior  knowledge of testing we will decide this later mark this decision as still open decision and not locked
* Vitest
* Biome
* Vercel

Follow the project's existing implementation and engineering specifications.

Do not introduce a new framework, backend service, CSS system, state-management library, animation library, or infrastructure without a concrete reason and explicit approval when appropriate.

---

# 15. Schema and Domain Scope

The V1 domain/schema is **Not LOCKED yet** but don't edit it for the current landing page.

The finalized V1 schema must not be modified as part of ordinary landing-page work.

For the current landing-page phase:

**Domain/schema work is OUT OF SCOPE unless explicitly requested.**

Do not:

* redesign the schema
* invent waitlist/domain tables without instruction
* modify Draft/Publication semantics
* introduce new domain entities
* introduce future-feature infrastructure
* duplicate Better Auth tables

If waitlist functionality requires persistence, use the explicitly approved/simple mechanism for that task rather than expanding the SkillTrail domain model unnecessarily.

---

# 16. Next.js Rules

Follow Next.js App Router conventions.

Prefer:

* Server Components by default
* Client Components only when interactivity requires them
* Server Actions or appropriate server-side mechanisms for mutations
* semantic HTML
* proper metadata
* accessible forms
* progressive enhancement where practical

Do not move logic into the client unnecessarily.

Do not expose secrets or server-only credentials to client components.

---

# 17. Code Quality

Use:

* strict TypeScript
* explicit types where useful
* small composable components
* clear naming
* Zod validation where input validation is required
* accessible HTML
* maintainable Tailwind classes
* existing project conventions

All interactive elements should have unique, descriptive IDs when required by the project.

Follow SEO fundamentals:

* title
* description
* semantic structure
* appropriate headings
* accessible links
* meaningful metadata

---

# 18. UI Quality Gate

A UI is not complete merely because it compiles.

## Visual

Evaluate:

* distinctive visual identity
* clear hierarchy
* intentional typography
* consistent spacing rhythm
* strong composition
* memorable visual motif
* appropriate contrast
* product-specific visual language
* meaningful use of motion
* no generic SaaS patterns

## Product Specificity

Ask:

> **Does this feel like a product created by a developer who personally experienced this problem?**

And:

> **Could this exact UI belong to another random AI SaaS?**

If yes, redesign it.

## Responsive

Verify at:

* 375px
* 768px
* 1280px+

Check:

* no horizontal overflow
* intentional mobile hierarchy
* readable typography
* appropriate spacing
* usable forms and CTAs

## Interaction

Check:

* hover
* focus-visible
* active
* disabled
* loading
* error
* success

## Accessibility

Check:

* keyboard navigation
* semantic HTML
* accessible labels
* visible focus
* sufficient contrast
* reduced-motion behavior

## Performance

Check:

* unnecessary Client Components
* expensive animation
* image optimization
* layout shift
* unnecessary dependencies

---

# 19. Design Skills

When available, use:

`.agents/skills/frontend-design/SKILL.md`

for **visual direction and distinctive frontend design**.

Use:

`.agents/skills/web-design-guidelines/SKILL.md`

for **interface-quality review and implementation auditing**.

Use:

`./docs/design-direction.md`

as the project's design direction when available.

These are complementary.

### frontend-design

Answers:

> **What should this experience look and feel like?**

### web-design-guidelines

Answers:

> **Does the implementation meet a high interface-quality standard?**

Neither skill overrides explicit SkillTrail product decisions.

---

# 20. Design Workflow

For every meaningful UI task:

### 1. Understand

Identify:

* user
* problem
* purpose of the screen/section
* desired action
* relevant SkillTrail story

### 2. Inspect

Before changing code:

* inspect the existing implementation
* inspect surrounding sections
* inspect existing components
* inspect design tokens
* inspect relevant project documentation
* inspect the existing visual language

Do not redesign blindly.

### 3. Design

Decide:

* visual hierarchy
* typography
* spacing
* layout
* interaction
* visual motif
* content hierarchy
* responsive behavior

The design should communicate the **specific problem and story**, not just the feature.

### 4. Implement

Use the existing project stack.

Avoid unnecessary dependencies.

### 5. Run

Run the application and inspect the actual rendered result.

### 6. Review

Review against:

* `.agents/skills/frontend-design/SKILL.md`
* `.agents/skills/web-design-guidelines/SKILL.md`
* `./docs/design-direction.md`
* this AGENTS.md

### 7. Find Weaknesses

Identify at least the **5 weakest design decisions**.

Consider:

* generic composition
* weak hierarchy
* poor typography
* excessive decoration
* unclear product story
* weak CTA
* inconsistent spacing
* poor mobile behavior
* unnecessary animation
* lack of product specificity

### 8. Improve

Fix the weakest decisions.

### 9. Reinspect

Render and inspect again.

Do not stop after the first implementation if obvious improvements remain.

### 10. Complete

Only consider the UI complete after the second inspection passes the quality gate.

---

# 21. Storytelling Quality Gate

For every major landing-page section, ask:

### What problem does this section represent?

### What part of the founder story does it reinforce?

### What does a developer recognize about themselves here?

### Does the copy sound like a real developer or a marketing department?

### Does the visual design reinforce the message?

### Is this communicating something specific to SkillTrail?

If the answer is no, revise it.

---

# 22. Do Not Turn Every Section Into a Feature List

The landing page should have a narrative arc.

Prefer:

**My problem**

→ **Why this matters**

→ **What I'm building**

→ **How it helps**

→ **Why it is different**

→ **Build with me**

over:

**Feature 1**

→ **Feature 2**

→ **Feature 3**

→ **Feature 4**

→ **Sign up**

Features should support the narrative.

They should not become the narrative.

---

# 23. Founder-Authentic Copy

When writing copy for SkillTrail, prefer first-person language where the founder story is relevant.

For example:

> **I’m building this because I needed it too.**

> I’m a developer who knows how to build things, but struggled to turn that work into stories, a personal brand, and a consistent presence on social media.

> SkillTrail started with that problem.

> Now I’m building it for developers who have the same problem — one iteration at a time, based on what actually helps.

This type of language is preferable to generic descriptions such as:

> "SkillTrail empowers developers to leverage AI to maximize their social presence."

The latter can describe almost any startup.

The former explains **why this product exists**.

---

# 24. Scope Discipline

Do not expand the task unnecessarily.

If asked to build a landing-page section:

Do not:

* redesign the entire application
* introduce a design system rewrite
* refactor unrelated components
* change the database architecture
* add future features
* add analytics infrastructure without instruction
* introduce unnecessary dependencies

Make the smallest high-quality change that solves the requested problem.

---

# 25. Ship → Learn → Improve

SkillTrail is intentionally being developed through iteration.

Optimize for:

**SHIP → LEARN → IMPROVE**

Do not spend excessive effort solving hypothetical future problems.

Build the smallest correct version.

Get it in front of real developers.

Learn from their feedback.

Then improve it.

The founding-user feedback loop is part of how the product itself should evolve.

---

# 26. Final Completion Report

After completing a meaningful task, report briefly:

### Changed

What was changed.

### Verified

What was actually tested or inspected.

### Design review

Any important visual or UX decisions made.

### Remaining

Any known limitations or unresolved decisions.

Do not claim something was verified if it was not actually verified.

---

# Core Principle

When in doubt, remember:

> **SkillTrail is not a generic AI product looking for a market.**
>
> **It is a developer building a solution to a problem he personally experienced, for other developers who experience the same problem.**

Every important product and design decision should preserve that truth.

**Build for developers.
Tell the story behind the work.
Listen to the people using it.
Iterate from real feedback.**
