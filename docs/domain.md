# SkillTrail — Domain

This document explains what the domain concepts _mean_ and the invariants that must be preserved. For exact field definitions, see `db/schema/*.ts` and `db/relations.ts` as the authoritative implementation.

---

## Core Entity Map

```
User (Better Auth)
  ├── Application Profile      (1:1 with user; SkillTrail-specific personalization)
  ├── Social Connections        (publishing authorizations, separate from Better Auth accounts)
  ├── Media Library             (reusable uploaded assets)
  │
  ├── Content                   (one user submission = one Content item)
  │     └── Composition         (one Content → many Compositions)
  │            └── Draft        (one Draft per platform per Composition)
  │                  ├── AI Generation History
  │                  └── X-specific structure when applicable
  │
  ├── Research                  (background research sessions)
  ├── Discovery                 (global items + user personalization)
  ├── Notifications
  └── Publications              (external publishing lifecycle; separate from Draft)
```

---

## Entity Meanings and Invariants

### Content

The user's underlying raw material and context. One user submission = one Content item.

- Input may be text, notes, files, or images — no required format.
- `origin` distinguishes manual input, research-derived, and discovery-derived content.
- A Content item contains `understandingResult` (AI's extracted story from raw material). This is regenerable cached data, not a reviewable AI proposal.
- **Invariant:** Content-level AI operations (understanding, angle generation) do not participate in the draft-level accept/reject/undo review flow.

### Angle

A suggested way to tell the story from a Content item or Research session.

- Angles are AI-generated; there is no concept of a manually authored angle.
- An Angle belongs to exactly one parent: either a Content item or a Research session (enforced by a CHECK constraint in the schema).
- A Composition may optionally reference an Angle. A Composition with no Angle is valid.
- **Regenerate = same angle, new execution.** Changing the angle creates a new Composition.

### Composition

A specific social-content creation intent derived from Content.

- One Content → many Compositions.
- A Composition represents "I want to create a post about this piece of content, from this angle."
- **Invariant:** Changing the angle creates a new Composition. Regenerating the draft does not.

### Draft

A platform-specific, mutable working document within a Composition.

- Exactly one Draft per platform per Composition (enforced by unique constraint: `(composition_id, platform)`).
- Draft is **mutable working state**. It is never versioned as separate rows. All version history lives in `ai_generation`.
- Platforms: `linkedin`, `x`.
- A user can create and edit a Draft manually without using AI.
- **Invariant:** AI must never overwrite a Draft without an explicit user action. Manual edits are never blocked except while an AI proposal is pending (see AI Review below).

### AI Generation / Review

When AI mutates a Draft, the result is a proposal requiring explicit user acceptance or rejection.

- While an AI proposal is pending: manual editing of that Draft is blocked; the proposal persists across page refreshes.
- Accepting the proposal: makes it the current Draft state; marks it as an accepted AI version.
- Rejecting/undoing the proposal: restores the previous accepted state; the rejected generation remains in AI history.
- **AI generation history is a V1 user-visible feature** (not just an internal log) — users can view, compare, and restore prior AI generations.
- Undo means: reverse the specific AI operation on the fields it actually changed. It is not a general-purpose editor undo.
- AI history is scoped per Draft. Deleting the owning Draft/Content deletes associated AI generations.
- Individual AI generations cannot be deleted by the user.
- Restoring an older AI generation requires explicit user confirmation and does not delete newer generations.
- If an older generation belongs to an older Composition state, it can be viewed but restoration requires creating a new Composition.

Key invariants:

- `INVARIANT-AI-003`: An AI proposal requires explicit user acceptance/rejection.
- `INVARIANT-AI-004`: Normal manual editing is blocked while an AI proposal is awaiting acceptance.
- `INVARIANT-AI-005`: Individual AI generations cannot be deleted by the user.
- `INVARIANT-AI-011`: A pending AI proposal must be resolved before scheduling.
- `INVARIANT-AI-013`: Changes to the mutable Draft do not silently mutate an approved scheduled snapshot.

### Publication

The external publishing lifecycle, deliberately separate from the mutable Draft.

```
Composition
  ├── Draft       (mutable working state)
  └── Publication (approved publish state / history)
```

- A Publication represents a specific act of publishing or scheduling to publish to an external platform.
- **Invariant:** Deleting a Publication externally does not delete the Draft or Content. The two operations must not be conflated.
- **Invariant:** Deleting local SkillTrail content does not automatically delete the external platform post.
- An explicit "Delete from X / Delete from LinkedIn" action removes only the external post; the Draft and Content remain.
- If external deletion fails: `delete_failed` state; user can retry.

### Scheduled Snapshot

When a Draft is scheduled, SkillTrail creates an immutable approved snapshot.

- The snapshot contains everything required to reproduce the exact approved publication (text, media refs + order, platform-specific data, X thread structure, reply/quote target).
- **Invariant:** Draft edits after scheduling do not silently change the scheduled snapshot.
- The user can explicitly replace a scheduled snapshot with the current Draft, requiring confirmation.
- If the current Draft differs from the scheduled snapshot, the UI shows a visible warning.
- Cancelling a schedule cancels the Publication only; the Draft remains.
- The same Composition/Draft can have multiple independent scheduled Publications, each with its own snapshot.

### Publication Status Model

```
SCHEDULED → PUBLISHING → PUBLISHED
                ↓ (retry)
           PUBLISH_FAILED

SCHEDULED → CANCELLED

Deletion path:
PUBLISHED → DELETING → DELETED / DELETE_FAILED
```

Failure reasons: `account_disconnected`, `platform_error`, `rate_limited`, `validation_error`, `unknown`.

### Social Connection

A publishing authorization for LinkedIn or X. Distinct from Better Auth's `account` table (which manages application login).

- Social tokens must never be exposed to client code.
- Three distinct states: **Connect** (authorize), **Disconnect** (stop active authorization; remembered account stays), **Delete** (remove the remembered account record from SkillTrail; does not delete the actual external account).
- A user may have multiple external accounts per platform.
- External identity uniqueness: `UNIQUE(platform, platform_user_id)` — one external account can only be associated with one SkillTrail user.
- If a social account is disconnected before a scheduled publish time: `PUBLISH_FAILED` with `failureReason = account_disconnected`.
- Disconnecting does not erase published history.

### Media

Uploaded file assets stored in Cloudflare R2 (database stores metadata/references only).

- Media belongs to a user and is reusable across content items and compositions.
- A media asset can serve two distinct roles:
  - **Context media** (`content_context_media`): provides AI context/input during content understanding
  - **Publishing media** (`draft_media`): appears in the actual published post
- These roles are tracked separately; the same asset can serve both simultaneously.

### Research

A background research session initiated by the user (e.g., "What's new in AI coding agents this week?").

- Research produces sources, a synthesis, and content angles.
- A Content item created from a Research session retains traceability back to the Research session.

### Discovery

Technology/developer news items surfaced for content inspiration.

- Architecture: global discovery items + per-user personalization (not user-specific items).
- When a user clicks "Create Post" from a discovery item, the discovery context is opt-in (checkbox confirmation), not automatic.

### User Profile vs Social Connection

These are distinct concepts:

- **Connected account**: "I have authorized SkillTrail to publish to this platform/account."
- **Preferred platform**: "I normally want content generated/published here."

These are stored separately. A user can connect an account without making it a preferred platform, and vice versa.

---

## What Is Not in This Document

The exact column definitions, index choices, and Drizzle-specific decisions are in `db/schema/*.ts`, `db/relations.ts`.Do not duplicate them here.
