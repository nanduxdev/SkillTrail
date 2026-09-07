# Product Requirements Document — AI Technical Content Assistant

**Status:** Draft v0.4 (supersedes v0.3 — Post Preview section added)
**Primary objective:** Build a genuinely useful product for ourselves, validate it with ~10 real users, and use the project as a strong portfolio demonstration.
**Initial budget:** Maximum ~₹3,000 before revenue.
**Initial platforms:** LinkedIn + X
**V1 focus:** Human-controlled, AI-assisted content creation and discovery.

---

## 1. Product Vision

Build an AI-powered content assistant for **students and junior developers who want to build a public technical presence but struggle to consistently turn their work, learning, and industry developments into good social-media content.**

The product should make content creation feel less like:

> "I need to sit down and write a social-media post."

and more like:

> **"I'll dump what I have, and the assistant will help me turn it into something worth sharing."**

The product should help users:

1. Share what they're building and learning.
2. Discover relevant developments in technology.
3. Find interesting angles to talk about.
4. Generate platform-specific LinkedIn/X drafts.
5. Refine drafts through natural-language editing.
6. Preview and verify platform-native rendering.
7. Publish immediately or schedule them.
8. Maintain consistency through lightweight reminders/tracking.

---

## 2. Problem Statement

Target users frequently have **valuable technical experiences but fail to communicate them publicly.**

A student might finish a project, learn a difficult concept, solve a bug, or experiment with a new framework — but never post about it because they don't know how to turn the experience into a compelling post.

A junior developer may want to build a personal brand but struggle with:

> "What should I post?"

Meanwhile, technology moves fast (new AI models, frameworks, developer tools, open-source projects, engineering techniques, infrastructure). Users may want to discuss these developments to show they're keeping up with the industry, but researching, understanding, finding an original angle, and writing a post all create friction.

**Core problem:** Users are doing and learning interesting things, but the friction between *having* something worth sharing and *actually publishing it* is too high.

---

## 3. Target Users

**1 — Students attracting recruiters.** Want to demonstrate technical skills, projects, learning progress, problem-solving ability, and awareness of modern technologies. Desired outcome: *"Recruiters should be able to see what I can actually build and learn."*

**2 — Junior developers building a personal brand.** Want to become visible, demonstrate expertise, share projects and lessons, stay current, and build credibility.

**3 — Developers doing #100DaysOfCode.** Publicly documenting progress. Need low-friction daily input, quick transformation of raw progress into content, consistency reminders, and platform-specific drafts. Important: **#100DaysOfCode is a use case, not the product's identity** — the product should not require a dedicated "Day X" workflow.

---

## 4. Product Principles

**4.1 Zero-friction input.** No complicated forms. *"Give the AI whatever you have"* — messy notes, typed thoughts, screenshots, README, images, project info, lessons learned. The AI organizes it.

**4.2 Human remains in control.** The product assists; it never independently decides what the user believes, what they should claim, what gets published, or when. The user reviews before publishing.

**4.3 AI improves the user's voice, not replace it.** The goal isn't generic "AI LinkedIn posts." The system should eventually learn the user's preferred tone, vocabulary, technical depth, formatting, and emoji preferences — but the user is always the final authority.

**4.4 Build only what earns its complexity.** Every V1 feature must solve a real user problem. Avoid infrastructure or features added because they're technically interesting.

**4.5 User value before automation.** First milestone: a user creates a post they genuinely want to publish. Automation comes after that.

---

## 5. Core Product Experiences

V1 has two primary experiences:

```text
                 PRODUCT
                    │
          ┌─────────┴─────────┐
          │                   │
       CREATE              DISCOVER
          │                   │
     "What did I do?"   "What's happening?"
```

Both converge on:

```text
Content angle → LinkedIn + X drafts → AI editing → Post preview & verification → Publish / Schedule
```

---

## 6. Experience A — Create From My Work

**User goal:** *"I did something interesting. Help me turn it into a post."* This is the most important workflow in V1.

**Input** — any combination of, none required exclusively:

- **Text:** what they built, worked on, tried, what went wrong, what they learned, raw thoughts.
- **Files:** README, project documentation, notes.
- **Images:** screenshots, workspace photos, architecture diagrams, project UI, code screenshots.

---

## 7. AI Understanding

The AI receives the user's raw material and attempts to identify:

- **Problem** — what was being solved?
- **Approach** — what did the user try?
- **Solution** — what did they build or change?
- **Challenges** — what went wrong or required effort?
- **Learning** — what did the user learn?
- **Interesting details** — what would make this useful/interesting to another developer?

The system should avoid inventing facts that aren't present in the user's material.

---

## 8. Content Angles

Before generating the final post, the system suggests multiple ways to tell the story:

- **Problem:** "I kept running into X, so I built Y."
- **Learning:** "One thing I learned while building X..."
- **Unexpected challenge:** "I thought X would be simple. It wasn't."
- **Technical insight:** "Here's what surprised me about X..."

Exact count is a product decision to test, but **multiple angles should be part of the experience.**

---

## 9. Platform-Specific Generation

```text
Selected angle
      │
      ├───────────────┐
      ▼               ▼
 LinkedIn             X
  Draft              Draft
```

Generate **separate, platform-appropriate drafts** — not a LinkedIn post mechanically shortened for X. Account for platform limitations, including posting without a premium X account.

---

## 10. AI Editing

Generated content stays editable through normal text editing **and natural-language instructions**, e.g.:

> "Make it more casual." · "Don't use emojis." · "Make it sound like me." · "Explain the technical part more." · "Shorten this." · "Give me a stronger hook." · "Remove the AI-sounding language."

The system modifies the selected draft while preserving factual meaning unless explicitly told otherwise.

---

## 11. User Images

V1 supports two capabilities:

- **Attach image** — accompanies the post as-is.
- **Understand image** — AI analyzes it and incorporates relevant details into the content:

```text
User uploads architecture screenshot → AI analyzes screenshot → relevant technical details → used when generating/refining draft
```

---

## 12. Explicitly Excluded: AI Image Generation

Not part of V1 — it introduces a separate model, inference pipeline, infrastructure, storage requirement, potential GPU cost, and generation workflow. Potential future feature, especially for researched-technology posts.

---

## 13. Publishing

After review and platform verification:

**Publish immediately:** Edit → Preview & Verify → Post to LinkedIn / Post to X
**Schedule:** Edit → Preview & Verify → Choose date/time → Schedule → Automatic publishing

Users should be able to schedule content independently per platform where practical.

---

## 14. Post Preview & Verification

Solves: *"How will my post actually look when published on LinkedIn or X? Are there formatting issues or character overflows?"*

Before publishing or scheduling, the system provides a platform-native visual preview of the generated and edited post.

```text
Drafting / AI Editing → Platform Preview (LinkedIn & X) → User Verification → Publish / Schedule
```

**Key Capabilities:**

- **Native Platform UI Simulation:** Visual rendering of how the post will appear on LinkedIn (feed layout with line breaks and formatting) and X (tweet container with handle, avatar, line breaks, and link cards).
- **Character Count & Limit Checks:** Real-time character counter evaluated against platform constraints (e.g., X 280-character limit for standard accounts vs. LinkedIn 3,000-character limit), warning the user if text is truncated or exceeds bounds.
- **Media & Attachment Preview:** Inspect attached images, code screenshots, or architecture diagrams alongside the text to verify layout and visual framing.
- **Platform-Specific Toggle:** Switch between LinkedIn and X previews seamlessly to verify each platform's distinct formatting.
- **Explicit Verification Gate:** Users review and confirm the preview before proceeding to publish immediately or schedule the post, preventing accidental posting of malformed drafts.

---

## 15. Experience B — Discover

Solves: *"I don't have something specific to post. What's happening in tech that I should know about?"* Two modes:

**15.1 Personalized Discovery Feed** — presents relevant developments across categories such as AI, developer tools, frameworks, open source, infrastructure, programming, and emerging technologies. Categories evolve based on user behavior.

---

## 16. Discovery Feed Content

Not just headlines. Each item should answer:

- **What happened?** Short explanation.
- **Why does it matter?** Significance, in accessible technical language.
- **Why might this user care?** Personalized to interests/profile.
- **What could I talk about?** Possible content angles.

```text
────────────────────────────────
New AI model released by ______
What happened? ...
Why it matters ...
Why you might care ...
Possible angles
1. ...  2. ...  3. ...
             [Create Post]
────────────────────────────────
```

---

## 17. Specific Research

Users can initiate research directly, e.g. *"What's new in AI coding agents this week?"*, *"Research this new framework"*, *"Is this new model actually useful for developers?"* The system researches the topic and provides useful context, leading naturally into content creation.

```text
User question → Research → Find relevant information → Understand topic → Possible angles → Create post
```

---

## 18. Research → Content

Users select a discovered topic and say **"Create a post."** The system generates possible angles, a LinkedIn draft, and an X draft, reusing the editing/publishing workflow from Experience A.

---

## 19. Personalization

A basic user content profile. V1 may include:

- Technologies they're interested in
- Areas of development, experience level
- Content interests, preferred platforms
- Basic writing preferences (e.g., casual, technical, no excessive emojis)

**V1 boundary:** no advanced AI memory system initially — structured preferences are sufficient.

---

## 20. Consistency Tracking & Proactive Notifications

A lightweight system helps users notice when they haven't posted recently, e.g. *"You haven't posted in 3 days — want to share what you've been working on? [Create a post]."*

V1 includes **proactive consistency notifications**. A daily background check evaluates posting inactivity and, when the configured threshold is crossed, creates/sends a reminder so the user does not need to open the app first. This background task is handled by the durable task/scheduling layer (Trigger.dev in the engineering specification).

Potential V1 metrics: last post, posts this week/month, current streak, days since last post, and response rate to reminders. Goal is **encouragement**, not surveillance or aggressive gamification.

---

## 21. V1 Boundary: No Content-Journey Agent

The system will **not** initially maintain a Day 1 → Day 100 knowledge graph, track every topic covered, analyze content progression, auto-plan future content from years of history, or act as an autonomous content agent. Future opportunity — not V1.

---

## 22. Future "Build in Public Journey" (V2/V3)

```text
Day 1 → Day 2 → Day 3 → ... → Day 100
   │       │       │             │
   ▼       ▼       ▼             ▼
topics   skills  projects      lessons
```

Could eventually track what's been built, technologies learned, problems solved, topics discussed, content gaps, and progression to help maintain a coherent public journey. **Not V1.**

---

## 23. LinkedIn and X

**LinkedIn:** OAuth/account connection, create post, publish post, scheduling through our system.
**X:** same set — OAuth/account connection, create post, publish post, scheduling through our system.

Platform capabilities and API limitations must be validated against current official APIs before implementation. Platform-specific functionality should be isolated so changes to one platform don't affect the whole content system.

---

## 24. Authentication

Users need an account so the product can maintain profile, content, drafts, connected social accounts, preferences, schedules, publishing history, and consistency information. Social platform authentication is kept separate from application authentication.

---

## 25. Content Lifecycle

```text
RAW INPUT → ANALYZING → ANGLES GENERATED → DRAFT → EDITING → READY
                                                        ├─────────────┐
                                                        ▼             ▼
                                                     PUBLISHED     SCHEDULED
                                                                      │
                                                                      ▼
                                                                  PUBLISHED
```

Failure states should also exist (e.g. `PUBLISH_FAILED`) so users know something went wrong rather than assuming success.

---

## 26. Draft Management & Content History

Users should be able to save, reopen, edit, and regenerate drafts; choose another angle; delete, publish, or schedule drafts. A generated post should not disappear if the user leaves the page.

V1 should also maintain a basic history of generated content, drafts, published posts, and scheduled posts — needed for usability and consistency tracking. This does **not** imply advanced long-term AI memory.

---

## 27. AI Safety / Accuracy Requirements

The AI should distinguish between:

- **User-provided facts** — explicitly contained in the user's notes/material.
- **Researched information** — obtained during discovery/research.
- **AI-generated framing** — hooks, angles, structure, wording.

The system should avoid fabricating project capabilities, technical results, benchmarks, personal experiences, or claims about technologies. For research-driven posts, it should retain source information so the user can verify important claims.

---

## 28. V1 Feature Priority

**P0 — Absolutely required:** User authentication · LinkedIn connection · X connection · Raw content input · Notes input · Screenshot/image upload · AI content understanding · Angle generation · LinkedIn draft · X draft · Manual editing · AI editing · Post preview & verification · Publish to LinkedIn · Publish to X · Scheduling · Draft persistence.

**P1 — Important:** Personalized discovery feed · Specific research · Research → post · Basic user interests/profile · Image understanding · Consistency tracking · **Proactive consistency notifications / posting reminders** · Content history.

**P2 — Future:** AI image generation · Long-term content memory · Day 1 → Day 100 continuity · Advanced topic tracking · Content-gap analysis · Advanced analytics · Automatic content strategy · Autonomous posting · Advanced personalization · Performance-based content optimization · **Self-hosted/GPU-based AI inference** (see §34–35).

---

## 29. Explicitly Out of Scope for V1

To protect the ₹3,000 budget and timeline, **not building**: Instagram, Threads, Facebook, TikTok, YouTube support · AI image generation · video generation · autonomous posting decisions · autonomous content agents · advanced vector memory · complex multi-agent systems · advanced analytics · automatic content strategy · full 100DaysOfCode tracking · topic-continuity engine · enterprise/team collaboration · agency management · payment/billing infrastructure (see §30) · **self-hosted AI models / rented GPUs** (see §34–35).

The product should first prove: **people use it to create and publish content.**

---

## 30. Business Model

**V1 commercialization:** The product is intended to become a paid SaaS product. The initial release will be provided free to a limited founding-user cohort (target: first 10 users) to validate the product, collect feedback, and establish usage patterns before introducing paid plans.

**Payment infrastructure:** Payment processing is not part of the V1 implementation. Billing will be introduced after initial product validation. The application architecture should avoid vendor-specific coupling so Stripe, Polar, or another provider can be integrated later.

---

## 31. Business Validation Goal

The first milestone is **not revenue.** It is **10 real users using the product** (see §30). We want to learn: Do they actually use it? Which workflow (Create vs. Discover) do they prefer? Does AI-generated content need heavy editing? Do they publish? Schedule? Return? What causes abandonment?

---

## 32. Initial Product Metrics

**Activation:** Sign up → Connect platform → Generate first post.
**Core usage:** posts generated, edited, published, scheduled.
**Discovery:** topics viewed, topics researched, research → draft conversions.
**Retention:** users returning after 7 days, users creating multiple posts, users publishing repeatedly.
**Consistency:** posting frequency, response rate to nudges.

Most important metric initially: **number of users who successfully create and publish multiple posts** — not raw AI generations.

---

## 33. Cost Constraint

The project starts with a **maximum of ~₹3,000 investment before paying users.** Architecture and feature implementation should prioritize:

- **Free / low-cost first.** Free tiers of hosted AI APIs, free/cheap data sources, free or cheap PostgreSQL hosting, open-source libraries, local development.
- **Pay only where unavoidable.** Likely unavoidable costs: social platform API access (if/when paid tiers become required), hosting, domain, storage. These should be identified **before implementation**, not after.

Self-hosted inference and GPU rental are **explicitly deferred** — see §34.

---

## 34. AI Strategy

**V1 default: free hosted APIs, not self-hosted models.**

For V1, all AI capabilities (content understanding, angle generation, content generation, editing, research synthesis, image understanding) should run on **free tiers of hosted AI provider APIs** — e.g. Google's Gemini free tier, or equivalent free tiers from other providers — rather than self-hosted, GPU-backed models.

This is a deliberate cost decision, not a technical limitation:

- We don't currently own a GPU capable of running a useful model locally.
- Renting a GPU to self-host introduces a new, ongoing cost (compute + storage + ops time) before we have a single validated user — directly against the ₹3,000 pre-revenue budget constraint.
- Free hosted-API tiers let us validate the product's actual AI workload (which prompts, how much volume, what latency/quality bar users need) before spending anything on inference infrastructure.

**Self-hosting is secondary, not eliminated.** It remains a valid path if and when the free-tier approach becomes insufficient — e.g. free-tier rate limits are consistently hit, per-request cost at higher volume becomes a bigger constraint than GPU rental, or a specific capability genuinely needs an open-source/fine-tuned model free APIs can't provide. That decision should be made **later, with real usage data**, not speculatively now.

**Design implication — stay model-agnostic.** Keep AI capabilities behind a thin internal interface so the underlying provider can be swapped without touching the rest of the app:

```text
AI
├── Content understanding
├── Angle generation
├── Content generation
├── Editing
├── Research synthesis
└── Image understanding
```

This lets us:

- Start with one free API (e.g. Gemini) as the default provider for all of the above.
- Add a second free-tier provider as a fallback if/when the primary's free-tier limits are hit for a given user or feature, without a rewrite.
- Swap in a self-hosted or paid model later, per-capability, only for the workloads that actually justify it (e.g. image understanding might need it before text generation does, or vice versa).

**Practical V1 guardrails:**

- Track free-tier usage/quota per provider from day one, so we know *before* we hit a hard limit, not after a user-facing failure.
- Design prompts and request volume conservatively (e.g. don't call the AI multiple times per keystroke) since free tiers are typically rate- and volume-limited.
- Treat "free tier is not enough" as a *signal to revisit this section*, not as an emergency — it means the product has real usage, which is itself a good outcome.

---

## 35. Product Architecture Implications — Deliberately Not Decided Yet

This PRD **does not prescribe** Next.js, Node, Bun, monorepo, worker, Redis, BullMQ, pgvector, Ollama, ComfyUI, MinIO, Kubernetes, or microservices. Those are implementation decisions — but the PRD gives us the questions to answer them with:

- **Interactive generation** (User → Input → AI → Draft) potentially doesn't require a separate worker.
- **Research** (User → Research → multiple sources → processing → synthesis) may justify background processing depending on actual implementation.
- **Scheduling** (Scheduled post → wait → publish) requires a reliable mechanism to execute work at the right time, but **does not automatically mean BullMQ + Redis + a dedicated worker.**
- **Image understanding** could plausibly be a normal AI request against a free hosted API (see §34) rather than a bespoke pipeline.
- **AI image generation** is excluded from V1 (§12), so its infrastructure doesn't influence initial architecture.
- **AI inference** runs against free hosted APIs in V1 (§34), so GPU provisioning, model hosting, and inference-serving infrastructure are **out of the V1 architecture entirely.**

This is exactly why we postponed architecture.

**The most important V1 constraint:** if we find ourselves spending several days debating monorepo vs. not, Bun vs. Node, or whether the worker needs BullMQ — before users can go **raw material → post → publish** — we're doing it wrong. The architecture exists to serve the product, not the other way around.

---

## 36. V1 User Journeys

**Student:**
```text
Finishes project → Opens app → Create → Dumps notes → Uploads README + screenshots
→ AI understands project → 3–5 angles → Student chooses angle → LinkedIn + X drafts
→ Student edits ("make this more casual") → Preview & verify platform rendering
→ Final review → Post now / Schedule
```

**Developer progress** (no separate #100DaysOfCode workflow):
```text
Finishes today's work → Opens Create → Dumps everything into one box → Optional screenshot
→ AI identifies story → Angles → LinkedIn + X → Edit → Preview & verify → Publish / Schedule
```
The system doesn't need to know whether this is Day 3, Day 37, Day 91, or simply Tuesday.

**Discover:**
```text
Opens Discover → Personalized developments → Selects topic → Reads summary/context
→ Sees possible angles → Create post → LinkedIn + X → Edit → Preview & verify → Publish / Schedule
```
or:
```text
"What's happening with AI coding agents?" → Research → Results → Angles → Draft → Preview & verify
```

---

## 37. The Core Product Loop

```text
BUILD → CAPTURE → CREATE → REVIEW → PREVIEW → SHARE → RETURN
```

And when the user has nothing to share:

```text
DISCOVER → LEARN → FIND ANGLE → CREATE → PREVIEW → SHARE
```

The consistency feature brings the user back when they fall out of the habit.

---

## 38. What Success Looks Like

**For you:** you stop doing *notes → copy to ChatGPT → ask for LinkedIn version → ask for X version → manually shorten → copy/paste → publish*, and instead: **open the app → dump everything → choose angle → edit → preview & verify → publish.**

**For users:** at least ~10 people use it, and some come back repeatedly to create/publish content.

**For your portfolio:** you can demonstrate problem → product → users → feedback → iteration → technical implementation → measurable usage.

---

## 39. Risks & Assumptions

### Key risks

| Risk | Why it matters | Mitigation direction |
|---|---|---|
| **Free-tier AI API limits are hit early** | Even 10 active users doing daily Create/Discover flows could burn through a single provider's free quota, especially with research + image understanding. | Track quota from day one (§34); design for a fallback provider; keep prompts lean; treat hitting the limit as a signal, not a crisis. |
| **LinkedIn/X API access, review, or pricing changes** | Both platforms gate posting/scheduling access behind developer approval and can change terms with little notice; X API tiers in particular have shifted before. | Validate current API terms before building publishing (§23); isolate platform code so a change to one doesn't break the other; have a manual "copy draft" fallback if API access is delayed or revoked. |
| **Single-developer bus factor / time constraint** | This is a solo/small project with a hard budget and (implicitly) limited personal time; scope creep is the most likely way to blow both. | §4.4 (build only what earns its complexity) and the P0/P1/P2 split exist specifically to guard against this — treat them as binding, not aspirational. |
| **AI fabrication / accuracy** | Users' credibility is on the line if the assistant invents details, benchmarks, or claims not in their source material. | §27 already sets this requirement; needs an actual eval/spot-check step before trusting AI output in the loop, not just a prompt instruction. |
| **Low or no user adoption** | The core validation goal (§31) — 10 real users — may not be reached, or reached but without repeat usage. | Recruit initial users from your own network (fellow students/junior devs) before building anything beyond P0; watch the "publish multiple posts" metric (§32) closely, it's the real signal. |
| **Handling of user-provided raw material (notes, screenshots, code)** | Users will paste unpublished project details, possibly including things they don't want stored indefinitely or exposed. | Decide and document a basic data-handling stance (what's stored, for how long, who can see it) before onboarding real users — even a simple policy is better than none. |

### Key assumptions

- Target users (students, junior devs) are willing to connect real LinkedIn/X accounts to a new, unproven tool.
- A free hosted AI API tier is sufficient in quality and quota to support ~10 users through the validation phase.
- Users have enough raw material (notes, screenshots, READMEs) readily available that "zero-friction input" is actually zero-friction in practice, not just in theory.
- Scheduling can be implemented reliably without heavyweight infra (§35) at V1's expected volume (~10 users, low post frequency each).
- ₹3,000 pre-revenue is sufficient to cover unavoidable costs (domain, hosting, possible platform API fees) if free tiers are used everywhere they're available.

---

## 40. V1 in One Sentence

> An AI-powered technical content assistant that lets students and junior developers dump what they've built or learned, discover relevant technology developments, turn either into platform-specific LinkedIn/X content, refine it with AI, preview and verify platform rendering, and publish or schedule it while maintaining a lightweight posting habit with proactive consistency notifications — built for V1 entirely on free hosted AI APIs, with self-hosted/GPU-based inference deferred until real usage data justifies it.

---

## What I'd do next

Not start coding yet. The next artifact should be a **V1 feature breakdown / engineering specification** derived from this PRD:

```text
Auth → Onboarding → Home
                      ├── Create
                      ├── Discover
                      ├── Drafts
                      ├── Scheduled
                      └── Profile
```

For every screen: UI, user actions, API operations, data required, AI operations, loading states, failure states, acceptance criteria.

**Only after that** should we derive the database schema and architecture — and at that point we can answer *"do I actually need a separate worker and monorepo?"* based on actual V1 workload (which, per §34–35, doesn't include running any AI model ourselves) rather than speculation.
