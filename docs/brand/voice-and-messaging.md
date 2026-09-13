# SkillTrail Voice & Messaging

## Purpose

Define **how SkillTrail speaks** — story, tone, and messaging rules for product copy, marketing, and UI strings. This is not a typography or color spec; see `brand-identity.md` and `ui-foundations.md` for visual implementation.

---

## Core Story

> **I'm building this because I needed it too.**

A developer who knows how to build things struggled to turn that work into stories, a personal brand, and a consistent presence online. SkillTrail started from that problem.

---

## Founder Story

**Guidance (from AGENTS.md):**

> I'm a developer who knows how to build things, but struggled to turn that work into stories, a personal brand, and a consistent presence on social media. SkillTrail started with that problem.
>
> Now I'm building it for developers who have the same problem — one iteration at a time, based on what actually helps.

**Rule:** Present as **solo developer building for developers** — not a team, agency, or corporate product org.

**Rule:** Use **“I”** for founder context unless explicitly asked otherwise. Avoid casual “we're building” / “our team” language.

---

## Problem Statement

Developers do meaningful work but often struggle with:

- What is worth sharing
- Turning technical work into a compelling story
- Finding the right angle and depth
- Maintaining voice and consistency
- Knowing what to post and posting regularly
- Building presence without becoming a full-time creator

---

## Product Thesis

> **The work already exists. SkillTrail helps developers find the story inside it and turn that story into something worth sharing.**

Supporting idea from product narrative:

> **You already did the work. Now tell the story.**

**Observed in brand verification mock UI:** “Turn what you build into a trail worth following.” — acceptable product-facing headline tone; aligns with trail metaphor.

---

## Brand Voice

Honest · thoughtful · technical · personal · confident (without pretending scale) · developer-native · practical · understated · human

---

## Voice Characteristics

| Do | Don't |
| --- | ----- |
| Concrete problems and situations | Abstract “empowerment” language |
| First-person founder honesty | Corporate “we innovate” voice |
| Specific developer contexts | Influencer / hustle culture |
| Understated confidence | Superlatives (“revolutionary,” “game-changing”) |
| Iteration and learning | Fake urgency or FOMO |

---

## Messaging Principles

1. **Story before feature list** — lead with the human problem, then how the product helps
2. **Capabilities support the narrative** — AI-assisted drafting, publishing, personalization appear in context of “work → story”
3. **No invented proof** — no fabricated metrics, logos, testimonials, or team size
4. **Founding users as collaborators** — early access + feedback shapes the product
5. **Ship → learn → improve** — iteration is a feature of how the product is built, not a marketing gimmick

---

## Core Message

**You build things. SkillTrail helps you tell the story.**

---

## Supporting Messages

- Building is easier than talking about what you built
- Your voice should still sound like you (personalization)
- Turn one piece of work into something you can share consistently
- Help shape what gets built next (founding users)

**Guidance:** V1 capabilities (drafting, LinkedIn/X publishing, history, consistency) should be framed through these problems — see `AGENTS.md` §7. **Rule:** Do not invent additional capabilities.

---

## Preferred Language

Examples aligned with established direction (adapt wording to context):

- “I built this because I had the problem.”
- “You already did the work. Now tell the story.”
- “The work already exists. Find the story inside it.”
- “I'm building this for developers who have the same problem.”
- “Build it with me.” / “Help shape what gets built next.”
- “Be one of the first developers to try it.”

---

## Language to Avoid

**Rule:** Avoid hype and generic growth copy, including:

- “Revolutionize your personal brand.”
- “10x your social presence.”
- “AI-powered growth machine.”
- “Dominate social media.”
- “Unlock your creator potential.”
- “The future of developer content.”
- “SkillTrail empowers developers to leverage AI to maximize their social presence.” (could describe any startup)

Also avoid: fake urgency, exaggerated promises, corporate mission statements, and implying a large team.

---

## Founder vs Product Voice

| Context | Voice |
| ------- | ----- |
| Why we exist, founding CTA, about | First person **I** |
| Product UI labels, empty states, help | Direct **you**; warm but concise |
| Error/system messages | Clear, technical when needed; no blame |

**Open decision:** Formal product name styling — use **SkillTrail** (camel case T) consistently; domain references may use `skilltrail.dev` lowercase.

---

## CTA Principles

Primary conversion: **founding users**, not a generic newsletter.

**Good framing:**

- Build it with me
- I'm building this because I needed it too
- Help shape what gets built next
- Be one of the first developers to try it

**Guidance:** CTAs should invite participation and feedback, not imply a finished enterprise product.

---

## Founding User Messaging

Purpose: find developers with the same problem who will **try, feedback, and influence priorities** — not just collect emails.

Communicate:

- Early access while the product evolves
- Real feedback loops (what works / what doesn't)
- Small, intentional early group — not a inflated “community” narrative

---

## Product Description

**Weak (avoid as lead):**

> SkillTrail is an AI-powered social media platform for developers.

**Better (problem-first):**

> I built software. I struggled to talk about it. SkillTrail helps turn the work you're already doing into stories worth sharing.

**Guidance:** Mention AI as a means (drafting, tone, depth), not as the identity of the product.

---

## Examples

### Good

- “I know how to build things. Turning that into a story was the hard part.”
- “SkillTrail helps you find the angle in work you've already done.”
- “Your drafts, your voice — with help when you're stuck.”
- “One developer building for developers.”

### Avoid

- “Supercharge your brand with AI.”
- “Join thousands of creators.” (unless true — **rule:** never invent numbers)
- “Our team of experts…”
- “The all-in-one growth platform for devrel.”

---

## Copy Review Checklist

1. Does it start with a recognizable developer problem?
2. Does it sound like a person, not a marketing department?
3. Is the founder scale honest (solo builder)?
4. Are claims factual and documented?
5. Are features only those established for V1?
6. Would this sentence fit any random AI SaaS? If yes, rewrite.
7. Is the CTA about shaping the product, not hype?

---

## Source Files

- `AGENTS.md` — canonical product story, tone, CTA, and anti-patterns
- `docs/brand/brand-identity.md` — who SkillTrail is
- `public/brand/brand-verification.html` — example product headline in UI mock
- Landing copy in `app/(marketing)/page.tsx` — **current implementation**; audit against this doc when iterating copy

---

## Known Gaps

- No centralized `messages.json` or copy style guide for UI microcopy yet
- Root layout metadata still default Next.js placeholder (“Create Next App”) — not aligned with brand messaging
