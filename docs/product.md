# SkillTrail — Product

## What SkillTrail Is

SkillTrail helps developers turn the work they are already doing into stories worth sharing.

Building software and communicating its value are different skills. A developer can spend days on something meaningful and still struggle with: figuring out what is worth sharing, finding the right angle, explaining it at the right depth, maintaining a consistent voice, and posting regularly.

SkillTrail is built to solve that problem — by a solo developer who experienced it himself.

**The goal is not to turn developers into full-time content creators.** The goal is to help developers tell the stories inside work they have already done, and build a recognizable presence over time.

---

## Current Phase

The current work is a **Coming Soon landing page** focused on:

1. Communicating the problem
2. Establishing a distinctive product identity
3. Capturing founding-user signups

Founding users are early developers who experience the same problem and are willing to try the product while it evolves, share what works and what does not, and influence what gets built next. They are collaborators, not a mailing list.

---

## V1 Target Users

Developers — including students, junior developers, and working engineers — who do meaningful technical work but fail to communicate it publicly. The friction between _having_ something worth sharing and _actually publishing it_ is too high.

> Note: The PRD v0.3 framed the audience as "students and junior developers." AGENTS.md and subsequent decisions reflect a broader "developer" framing, building from the founder's own problem. The broader framing is the current intent.

---

## V1 Product Scope

### Two Core Experiences

**Create:** The user has something interesting. SkillTrail helps turn it into a post.
Input = raw notes, text, files, screenshots. No required format.

**Discover:** The user has nothing specific to post. SkillTrail surfaces relevant technology developments and possible content angles.

Both experiences converge on: angle selection → platform-specific drafts → AI editing → preview/verification → publish or schedule.

### V1 Capabilities (Locked)

- AI-assisted content understanding and angle generation from raw user material
- Platform-specific draft generation for LinkedIn and X (not a LinkedIn post mechanically shortened for X)
- Natural-language AI editing of drafts
- Post preview and verification (platform-native visual simulation, character count checks)
- Publish immediately or schedule, independently per platform
- Personalization: experience level, technologies (hybrid suggested+custom), interests (hybrid), writing preferences (structured controls + free-form instruction)
- AI generation history per draft: view, compare, restore AI versions
- Reusable media library; media can serve as AI context and/or publishing media
- Consistency tracking with proactive reminders (in-app + email)
- Research/discovery feature for external technology topic exploration
- Content history

### V1 X-Specific Support (Locked)

- Standalone post
- Reply to external X post (including picker with pagination/search)
- Self-reply (to user's own published post)
- Generated thread (chain of self-replies; posts are individually editable/reorderable)
- Quote of user's own post

### Explicitly Out of Scope for V1

Instagram, Threads, Facebook, TikTok, YouTube · AI image generation · autonomous posting · long-term content-knowledge graph · advanced analytics · enterprise/team features · payment/billing infrastructure · LinkedIn carousel/document posts (deferred to V2) · self-hosted AI inference

---

## Key Product Principles (Locked)

**Human remains in control.** AI assists; the user reviews before publishing. AI must never overwrite manual edits without explicit instruction.

**Story before feature list.** The experience should help find the story inside work, not present a feature catalogue. Multiple content angles must be part of the creation experience.

**Zero-friction input.** Accept messy notes, typed thoughts, screenshots, READMEs, images — the AI organizes it.

**AI improves the user's voice, does not replace it.** Personalization (tone, depth, emoji usage, free-form instruction) exists so generated content still sounds like the user.

**No fabrication.** The AI must not invent facts, benchmarks, or claims not present in the user's material.

**Iteration over speculation.** Ship → learn → improve. Build only what earns its complexity. No infrastructure added for hypothetical future scale.

---

## Business Model

V1 will be free for a small founding-user cohort (~10 users) for product validation. Payment infrastructure is deferred until after initial validation. The architecture must avoid vendor-specific coupling so a payment provider (Stripe, Polar, or equivalent) can be integrated later.

The first milestone is not revenue — it is 10 real users using the product to create and publish content.

---

## Founding User CTA Principle

The primary conversion goal is founding-user recruitment, not a generic newsletter signup.

Good framing:

- "Build it with me."
- "I'm building this because I needed it too."
- "Help shape what gets built next."

The CTA communicates that early users can provide real feedback that influences what gets built next.

---

## Finalized Decisions Previously Flagged as Assumptions

- **Writing preference enum values are locked.** `writing_tone`: `casual | balanced | formal`. `technical_depth`: `beginner_friendly | detailed | expert`. `emoji_usage`: `none | minimal | frequent`. These are no longer `[ASSUMPTION]` in the schema.
- **Custom technologies become globally visible suggestions.** When a user adds a custom technology during onboarding, it is de-duplicated and becomes available as a suggestion to all users. This is intentional product behavior.
