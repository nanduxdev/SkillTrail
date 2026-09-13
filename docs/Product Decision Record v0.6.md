# SkillTrail — Product Decision Record
## Core V1 Product Decisions

**Status:** Draft v0.6 (supersedes v0.5 — Scheduling and AI undo/versioning decisions finalized)  
**Purpose:** Canonical record of SkillTrail's core V1 product/schema decisions. This document contains the locked V1 baseline, finalized scheduling behavior (Part 20), finalized AI undo/versioning behavior (Part 21), and the remaining V1 schema-design work.
**Date of Creation:** September 5, 2026  
**Product:** SkillTrail (working product name; final naming to be decided later)


---

# Part 0 — Decisions Made Before Q1

These were explicit decisions recorded immediately before the numbered rounds.

## A. Authentication

### Question

Do we want:

- Email/password + Google
- Google only
- Email/password + Google + username

### User answer

**Email/password + Google + Username.**

### Status

**LOCKED**

### Final decision

V1 authentication:

- Email/password
- Google
- Username

---

## B. Public Profile

### Question

Do we want a public profile in V1?

A possible future example was:

```text
/@username

name
bio
technologies
posts
```

### User answer

The user did **not** immediately choose yes/no. They asked to brainstorm the idea because the concept of a public profile was not yet clear.

### Status

**NOT LOCKED AT THIS POINT**

Later product decisions explicitly established:

- private application profile in V1
- no public SkillTrail social profile/page in V1

Therefore the final product direction is:

### Final decision

**No public profile/social-network layer in V1.**

Username still exists in V1 for the application/auth experience.

### Status

**LOCKED by later decision**

---

## C. Proactive Consistency Notifications

### Question

What does proactive consistency notification mean in V1?

Options:

1. In-app only
2. Email only
3. In-app + email

### User answer

**In-app + email.**

### Status

**LOCKED**

---

## D. Discovery Storage

### Question

Should discovery use:

```text
global discovery items
        +
user personalization
```

or:

```text
user-specific discovery items
```

### User answer

**Global discovery items + user personalization**, because it is architecturally cleaner.

### Status

**LOCKED**

---

## E. Draft Revisions

### Question

Do we need:

```text
draft
  ↓
revision history
```

in V1?

### User answer

**No.**

### Status

**LOCKED**

### Additional clarification

Full revision history is out of scope for V1.

AI generation history and the AI review/undo behavior are finalized in Part 21.

---

## F. AI Generations

### Question

Do we persist every AI generation?

### User answer

**Yes, minimally.**

Reason: debugging, cost visibility, and quality visibility.

### Status

**LOCKED**

### Final decision clarification

AI generation history is a V1 product capability, not merely an internal logging concern. Detailed AI undo/versioning behavior is defined in Part 21.

---

# Part 1 — User Profile & Personalization

## Q1. What should the user actually enter during onboarding?

### Question

Possible onboarding information:

```text
Name
Username
Experience level
What do you build with?
What topics are you interested in?
Where do you want to post?
How do you like your writing to sound?
```

For experience level, the proposed options were:

```text
Student
Junior
Mid-level
Senior
```

### User answer

**Option A.**

### Status

**LOCKED**

### Final decision

Experience level:

- Student
- Junior
- Mid-level
- Senior

---

## Q2. Technologies

### Question

How should users specify technologies?

- A — Free text/tags
- B — Predefined technology list
- C — Hybrid: suggested technologies + custom technology

### User answer

**C — Hybrid.**

The user explicitly agreed with this choice.

### Status

**LOCKED**

### Final decision

Start with suggested technologies while allowing:

```text
+ Add custom technology
```

---

## Q3. Interests

### Question

Should interests be:

- A — Free-form
- B — Predefined categories
- C — Hybrid: suggested categories + custom interests

### User answer

**C — Hybrid.**

### Status

**LOCKED**

### Final decision

Use suggested interest categories while allowing custom interests.

---

## Q4. Writing preferences

### Question

Should writing preferences be:

- structured controls
- free-form instruction
- both

The proposed structured controls included:

```text
Tone
Technical depth
Emojis
```

plus a free-form instruction such as:

> “Write like me. I'm casual, don't use corporate language, and I like explaining the technical details.”

### User answer

**Both.**

Specifically:

> Structured preferences + optional “Anything else?” instruction.

### Status

**LOCKED**

---

## Q5. Preferred platforms

### Question

Should preferred platforms be selected independently:

```text
☑ LinkedIn
☑ X
```

rather than automatically treating connected platforms as preferred?

### User answer

**Yes.**

The user agreed that these are two different concepts.

### Status

**LOCKED**

### Final distinction

**Connected account**

> “I have authorized SkillTrail to access this platform/account.”

**Preferred platform**

> “I normally want content generated/published here.”

Preferred platforms can be defaults, but the user can still choose target platforms for each creation.

---

# Part 2 — Content Model

## Q6. One Content → how many platform drafts?

### Question

Should V1 support multiple drafts per platform:

```text
LinkedIn
 ├── Draft A
 └── Draft B

X
 ├── Draft A
 └── Draft B
```

or:

```text
one LinkedIn draft
one X draft
```

per content item?

### User answer

**One active draft per platform in V1.**

The user additionally clarified that before generating a post, the UI should have platform checkboxes:

```text
☑ LinkedIn
☑ X
```

If only X is selected, generate X only.

If only LinkedIn is selected, generate LinkedIn only.

If both are selected, generate drafts for both.

### Status

**LOCKED**

### Final decision

One active draft per platform per composition.

Regeneration updates/replaces the current draft rather than creating multiple active drafts.

---

## Q7. What exactly is a Content item?

### Question

If the user creates:

> “Built OAuth integration.”

and later adds:

> “Also fixed token refresh.”

should that be the same Content or a new Content?

The initial recommendation was:

> One user submission = one Content item.

### User answer / clarification

The user was concerned about X's:

- self-reply
- thread

and explicitly wanted SkillTrail to support those.

They defined:

**Thread:** A connected series of posts where you reply to your own previous post to add information/context or continue a story.

**Self-reply:** The individual action of replying to your own published post.

### Status

**LOCKED — with clarification**

### Final decision

The original “one submission = one Content” concept remains the underlying content-model direction.

X continuity is handled at the **X composition/publication/thread relationship level**, not by forcing multiple user updates into one Content record.

A self-reply/thread is therefore not evidence that two separate Content records must be merged.

---

## Q8. Can one Content item produce multiple posts?

### Question

Can:

```text
Content
"I built an AI coding assistant"
```

produce multiple independent compositions?

For example:

```text
Content
 │
 ├── Composition #1
 │     ├── LinkedIn
 │     └── X
 │
 └── Composition #2
       ├── LinkedIn
       └── X
```

### User answer

**Yes.**

The user agreed with the recommendation that one Content item should be able to produce multiple “post compositions.”

### Status

**LOCKED**

### Final decision

Use:

```text
Content
   ↓
Post Composition
   ↓
Platform Draft(s)
   ↓
Publication(s)
```

One Content item can produce multiple independent compositions.

---

# Part 3 — Publishing

## Q9. Can the same post be published to both platforms?

### Question

Example:

```text
Post/Composition #123
 ├── LinkedIn → published
 └── X → scheduled
```

### User answer

**Yes.**

Each platform has its own publication state.

### Status

**LOCKED**

---

## Q10. Can the user schedule LinkedIn and X independently?

### Question

Example:

```text
LinkedIn → Today 7:00 PM
X        → Tomorrow 10:00 AM
```

### User answer

**Yes.**

### Status

**LOCKED**

### Final decision

Scheduling is independent per platform publication.

---

## Q11. What happens if the user edits a draft after scheduling it?

### Question

Two possible semantics:

### Option A — Latest draft

```text
Schedule
   ↓
Publication points to draft
   ↓
User edits
   ↓
Scheduled time → latest version publishes
```

### Option B — Snapshot

```text
Schedule
   ↓
Copy exact approved content
   ↓
User edits draft
   ↓
Scheduled time → original snapshot publishes
```

The recommendation was Option B because scheduling should mean:

> “Publish exactly what I approved when I scheduled it.”

### User answer

The user finalized **C — Snapshot by default + explicit update**.

### Status

**LOCKED**

### Final decision

When a draft is scheduled:

```text
Current Draft
    ↓
Schedule
    ↓
Immutable Scheduled Snapshot
```

Later edits to the current draft do **not** silently change the scheduled publication.

If the current draft differs from the scheduled version, SkillTrail shows:

```text
⚠ Scheduled version differs from current draft

Scheduled version: Version A

Your current draft has newer changes.

[Update scheduled post to this draft]
[Keep scheduled version]
```

Updating the scheduled version requires explicit confirmation.

Additional finalized scheduling rules:

- Cancelling a scheduled publication cancels the publication only; the draft remains.
- Rescheduling is allowed with confirmation.
- Publishing automatically retries before reaching `publish_failed`.
- Disconnecting the account before publishing results in `publish_failed`.
- The same composition can have multiple independent scheduled publications.
- Each scheduled publication has its own independent snapshot.
- The snapshot is a hybrid snapshot containing everything required to reproduce the exact approved publication.
- A draft edit never silently changes an existing scheduled snapshot.

See Part 20 for the complete scheduling specification.

---

## Q12. Can one Content item have multiple attachments?

### Question

Example:

```text
Content
 ├── screenshot-1.png
 ├── screenshot-2.png
 └── architecture.png
```

### User answer

**Yes.**

### Status

**LOCKED**

---

## Q13. Should attachments be reusable across posts?

### Question

Options:

### A
Attachment belongs permanently to Content.

### B
User has a reusable media library.

### User answer

Initially:

> Unsure, leaning toward B.

Later the user explicitly agreed with the reusable media-library direction.

### Status

**LOCKED by later clarification**

### Final decision

**B — Reusable media library in V1.**

Keep it simple.

Conceptually:

```text
media
──────
id
user_id
storage_key
filename
mime_type
size
created_at
```

Media can be reused across content/posts.

---

## Q14. When a user clicks “Create Post” on Discover, should the Discover item automatically become part of the Content's context?

### Question

The proposed workflow was:

```text
Discovery Item
       ↓
Create Post
       ↓
Content
       ↓
AI sees:
- user's original input
- discovery item
- source URL
```

The user should be able to remove that context through:

```text
☑ Use discovery context
```

### User answer

**Use the checkbox confirmation.**

### Status

**LOCKED**

### Final decision

Discovery context is used for generation only when the user explicitly confirms it.

---

## Q15. Research results

### Question

If research produces:

```text
Research
 ├── sources
 ├── synthesis
 └── content angles
```

and the user clicks Create Post, should the resulting Content retain a link to the **entire Research session**?

### User answer

**Yes.**

### Status

**LOCKED**

### Final decision

Maintain traceability:

```text
Content
   ↓
Research
   ↓
Sources
```

---

# Part 5 — Angle / Composition

## Q16. Should a Post remember which Angle created it?

### Question

Example:

```text
Content
"I built an AI coding assistant"

Angle 1 — How I built it
Angle 2 — What I learned
Angle 3 — Architecture
```

User chooses Angle 2.

Should we retain:

```text
post
──────
content_id
angle_id
```

### User answer

**Yes.**

### Status

**LOCKED**

### Final decision

A composition remembers its selected AI-generated angle when one was used.

Conceptually:

```text
Content
   ↓
Angle
   ↓
Composition
```

---

## Q17. Can a user create a Post without an AI-generated Angle?

### Question

Can the user say:

> “Don't generate angles. Just turn this into a LinkedIn post.”

Options:

- A — No
- B — Yes, angle is optional

### User answer

**B — Yes.**

### Status

**LOCKED**

### Final decision

The angle is optional.

AI is an assistant, not a mandatory gatekeeper.

---

# Part 6 — X Threads

## Q18. Should the user explicitly choose Single X Post vs X Thread during creation?

### Question

The original proposal was:

```text
○ Single X post
○ X thread
```

The user raised a different use case:

> They may have posted something yesterday and want today's relevant post to continue that previous post.

They also pointed out that if a user is not X Premium and therefore has a smaller post-length allowance, one piece of content may need to become multiple connected X posts.

### User answer

The user was **unsure about the exact UX** and wanted support for:

1. Continuing/replying to an existing X post.
2. Self-reply.
3. Threads.
4. Turning long content into multiple X posts when necessary.

### Status

**SUPERSEDED / CLARIFIED BY Q29–Q35**

The final X model is recorded below.

### Final direction

X supports distinct concepts:

```text
Single post
Self-reply to existing post
Generated thread
Quote user's own post
```

A generated thread is a chain of normal X posts connected by self-replies.

The exact UI for selecting/initiating these modes was clarified in the later X questions rather than this original Q18.

---

## Q19. Can the user manually add/remove/reorder posts in an X thread?

### Question

Example:

```text
1. Hook
2. Problem
3. Solution
4. Lesson
```

User can remove or reorder them.

### User answer

**Yes.**

### Status

**LOCKED**

### Final decision

Thread posts are individually manageable:

- add
- remove
- reorder
- edit

---

## Q20. Can an X thread be scheduled as one unit?

### Question

Example:

```text
X Thread
  ├── 1
  ├── 2
  ├── 3
  └── 4

Schedule → tomorrow 7 PM
```

The system publishes the chain automatically.

### User answer

**Yes.**

### Status

**LOCKED**

### Final decision

The user schedules the thread as one unit rather than scheduling every reply independently.

---

# Part 8 — Media Library Details

## Q22. Do you want a reusable media library in V1?

### Question

Should users have:

```text
Media
────────────────
architecture.png
oauth-flow.png
demo.png
screenshot.png
```

and be able to:

```text
+ Add media

[Upload]
[Choose from library]
```

### User answer

**Yes.**

The user agreed with the reusable media-library recommendation.

### Status

**LOCKED**

---

## Q23. If we introduce the media library, should media be attached to Post rather than Content?

### Question

The issue identified was that a screenshot can serve two different purposes:

1. **AI context/input**
2. **Actual publishing media**

The user suggested potentially having two separate sections:

```text
Context
→ Drop in documents/images for AI

Publishing media
→ Add media that should actually appear in the post
```

### Status

**LOCKED conceptually**

### Final decision

Use a reusable `media` asset and separate relationships for its roles:

```text
media
  ├── content_context_media
  │      └── used as AI context/input
  │
  └── post_media
         └── used as actual publishing media
```

This avoids forcing one screenshot to be either “context” or “published media.”

The same asset can serve both roles.

---

# Part 9 — Editing

## Q24. Should the AI editor modify the existing draft or create a new draft?

### Original question

Options:

### A

```text
Same draft
body gets replaced
```

### B

```text
New draft generated
```

The recommendation was A because V1 has one active draft per platform.

### User response / concern

The user raised an important requirement:

> If the current draft is updated and the user realizes the previous version was better, how can they undo it?

### Status

**LOCKED**

### Final decision

AI edits operate on the existing platform draft through an explicit review/acceptance step.

```text
Current accepted draft
        ↓
AI operation
        ↓
AI-generated proposal
        ↓
Accept / Reject
```

While an AI proposal is pending:

- normal manual editing is blocked
- the proposal remains persisted across page refresh
- the user can accept or reject/undo it

Finalized AI undo/versioning rules:

- Undo means **undo this specific AI operation**.
- Undo applies only to fields actually changed by that AI operation.
- AI generation/version history is a V1 user-visible capability.
- Manual-edit revision history is not stored.
- AI generation history is maintained per draft.
- Individual AI generations cannot be deleted by the user.
- Deleting the owning draft/content deletes its associated AI generations.
- Rejected AI generations remain in history.
- Accepted generations are marked as accepted AI versions.
- AI generations can be viewed and compared.
- Older AI generations can be restored.
- Restoring an older generation requires explicit confirmation.
- Restoring an older generation does not delete newer generations.
- If the generation belongs to an older composition state, it may be viewed, but restoring it requires creating a new composition.
- Immediate Undo/Redo is available during the AI review flow.
- Once the AI proposal is accepted, the pending Undo action disappears.
- AI acceptance is required before scheduling **only when an AI proposal is pending**.
- A manually created/editable draft with no pending AI proposal can be scheduled directly.

See Part 21 for the complete AI undo/versioning specification.

---

## Q25. Should users be able to edit the draft manually?

### Question

```text
AI generated
      ↓
User can freely edit
      ↓
Save
      ↓
Ready to publish
```

### User answer

**Yes.**

### Status

**LOCKED**

### Final decision

Users can freely edit drafts.

AI must never overwrite manual edits unless the user explicitly requests an AI edit/regeneration.

---

# Part 10 — Content / External Deletion

## Q26. If a user deletes Content, what should happen to its Posts/Drafts?

### Original question

Should deleting Content delete local child posts/drafts/publication records?

The key concern was already-published external posts.

### User answer

**Yes to deleting local content/child records as appropriate, but already-published external posts cannot be assumed to be unpublished.**

The user also added that deleting a published post from the external platform **from inside SkillTrail** is a valuable UX feature.

### Status

**LOCKED with later clarification**

### Final decision

Separate:

**Deleting/removing SkillTrail's local data**

from:

**Deleting the actual external X/LinkedIn post.**

Already-published external posts are not automatically removed merely because local content is deleted.

But SkillTrail should also support an explicit **Delete from X / Delete from LinkedIn** operation for published posts.

---

# Part 11 — Scheduled Posts

## Q27. Does the proposed scheduled-version behavior make sense?

### Question

The proposed safer behavior was snapshot semantics:

```text
Draft
"I built X"
        ↓
Schedule
        ↓
Publication snapshot:
"I built X"
```

Then the user edits the draft, but the scheduled snapshot remains unchanged.

### User answer

The user finalized **C — Snapshot by default + explicit update**, matching the behavior locked in Q11 and detailed in Part 20.

The user wanted the ability to edit tomorrow's scheduled content and explicitly replace the scheduled version with a newly edited draft. The security concern about someone unintentionally modifying scheduled content is addressed by requiring explicit confirmation before any scheduled snapshot replacement.

### Status

**LOCKED**

### Final decision

Keep an approved scheduled snapshot, while allowing explicit replacement:

```text
Scheduled version differs from current draft.

[Keep scheduled version]
[Update scheduled post to this draft]
```

Updating the scheduled version requires explicit confirmation. Rescheduling requires confirmation. Cancelling a schedule cancels only the publication; the draft remains. See Part 20 for the complete scheduling specification.

---

# Part 12 — Regeneration

## Q28. Should “Regenerate” mean the same angle with a different execution?

### Question

Example:

```text
Post
Angle: "What I learned"

LinkedIn draft
X draft
```

User clicks:

> Regenerate LinkedIn

Should AI:

- A — generate another version of the same angle
- B — generate a new angle

### User answer

**A.**

The user explicitly agreed.

### Status

**LOCKED**

### Final decision

> **Regenerate = same intent/angle, different execution.**

Changing the angle creates a different composition.

Conceptually:

```text
CHANGE ANGLE
     ↓
new Composition

REGENERATE
     ↓
same Composition, new draft execution
```

---

# Part 13 — X Existing Posts / Reply / Quote

## Q29. Should users choose an existing X post from inside SkillTrail for reply/quote?

### Question

Should the user be able to select an existing X post from inside SkillTrail when creating:

- a reply
- a quote

### User answer

**Yes.**

### Status

**LOCKED**

---

## Q30. Which existing X posts should SkillTrail show?

### Question

Should SkillTrail show:

- only posts published through SkillTrail
- or actual recent X posts, including posts published outside SkillTrail?

### User answer

**B — Their actual recent X posts, including posts published outside our app.**

### Status

**LOCKED**

### Final decision

The feature should work with the user's real X history, not just SkillTrail-created posts.

---

## Q31. How should existing X posts be browsed?

### Question

How many previous posts should be shown?

### User answer

**Recent posts with pagination/search.**

### Status

**LOCKED**

### Final decision

Existing-post picker supports:

- recent posts
- pagination
- search

---

## Q32. Should SkillTrail show how the post will look before publishing?

### Question

Should the app provide a preview of the final platform presentation?

### User answer

**Yes — for both LinkedIn and X.**

The user specifically clarified that this matters for quote posts because they want to see how the quote will actually look.

### Status

**LOCKED**

### Final decision

Platform-specific previews are required for:

#### X
- normal post
- reply
- quote post
- thread

#### LinkedIn
- normal post

The preview should simulate the platform presentation for the currently locked post types.

---

## Q33. What exactly is an X thread?

### Question

The user was confused whether a thread is a collection of quotes, self-replies, or something different.

### Clarification / final answer

A thread is a **collection/chain of X posts connected through replies**.

Example:

```text
Post 1
   ↓ self-reply
Post 2
   ↓ self-reply
Post 3
```

Therefore:

| Concept | Meaning |
|---|---|
| Standalone post | Independent X post |
| Reply | New X post replying to another X post |
| Self-reply | Replying to your own X post |
| Thread | Multiple X posts chained together through replies |
| Quote post | New X post that quotes/embeds another post |

### Locked SkillTrail rule

> **A generated thread consists only of normal X posts connected by self-replies.**

A quote post is a separate creation mode.

### Status

**LOCKED**

---

## Q34. Can users add more posts to an already-published X thread later?

### Question

Can a user continue an existing published thread later?

### User answer

**Yes.**

### Status

**LOCKED**

---

## Q35. Should SkillTrail eventually import/understand existing X threads created outside SkillTrail?

### Question

Should external X threads be importable/understandable so users can continue working with them?

### User answer

**Yes — P1.**

### Status

**LOCKED as P1**

### Final decision

External-thread import/understanding is P1, not required for the initial V1 if it adds significant complexity.

---

# Part 15 — Published Post Deletion

## Q39. What should happen when the user deletes a published post?

### User clarification

The actual requirement is:

> “I published it and don't like how it looks, so I want to delete it quickly.”

Therefore deleting the published post must delete the **external platform post**.

But the user wants the SkillTrail work to remain:

- draft
- context
- composition
- media
- relevant AI-generated information

so they can continue editing and potentially republish.

### Status

**LOCKED**

### Final decision

**Delete external publication, preserve SkillTrail work.**

The UX should be explicit:

> **Delete from X**
>
> This permanently removes the post from X. Your SkillTrail draft and content will remain available for editing.

Same principle for LinkedIn.

---

# Part 16 — External Delete Failure

## Q40. What happens if external deletion fails?

### Question

Options included:

- leave as published
- `delete_failed` + retry

### User answer

**B — `delete_failed` + retry.**

### Status

**LOCKED**

### Final decision

```text
publication
    ↓
delete request
    ↓
failure
    ↓
DELETE_FAILED
```

User can retry.

Underlying draft/content remains intact.

---

# Part 17 — Publication Status Refresh

## Q41. When should SkillTrail refresh publication status from X/LinkedIn?

### Question

The distinction discussed was:

### Option A
Refresh when the user opens Content/History.

### Option B
Refresh when the user interacts with that publication.

### User clarification

The user asked what the practical difference is and suggested that SkillTrail could potentially refresh status from the platform when the user interacts with the publication.

### Final direction

Do not build continuous real-time synchronization in V1.

Use interaction-driven refresh.

### Status

**LOCKED**

### Final decision

- Normal history can show locally known state.
- Opening/interacting with a publication can refresh external status.
- Important/destructive actions should verify current platform state.

This avoids unnecessary continuous API polling.

---

# Part 18 — Disconnecting Social Accounts

## Q42. What should happen when a user disconnects an account that has scheduled posts?

### Question

Options included warning/confirmation because scheduled posts may no longer be publishable.

### User answer

**Option C.**

### Status

**LOCKED**

### Final decision

If scheduled posts exist:

```text
You have scheduled posts.

Disconnecting this account means
SkillTrail can no longer publish them.

[Cancel]
[Disconnect]
```

The user must explicitly confirm.

Those affected scheduled publications should become visible failed/error states rather than silently disappearing.

---

## Q43. Should published history remain after disconnecting a social account?

### User answer

**Yes.**

The user additionally wants SkillTrail to be aware that scheduled posts can no longer publish after disconnection.

When the user returns, they should see an error explaining that scheduled posts failed because the account was disconnected.

### Status

**LOCKED**

### Final decision

Disconnecting does not erase published history.

Example:

```text
⚠ Scheduled post failed

Reason:
X account was disconnected.

[Reconnect X]
[View post]
```

The underlying draft/content remains available.

---

# Part 19 — Social Account Lifecycle

## Q44. How should reconnecting/disconnecting/deleting social accounts work?

### User answer

The user explicitly chose the logical identity:

```text
user_id + platform + platform_user_id
```

They also proposed this UX:

```text
Previously connected accounts

X
@username

[Reconnect]
[Delete]
```

while separately allowing:

```text
Connect new account
```

### Status

**LOCKED**

### Final decision

There are three distinct states/actions.

### 1. Connect

Authorize the external account.

### 2. Disconnect

Stop active authorization.

**Disconnect does not delete the remembered account from SkillTrail.**

The account can later be reconnected.

### 3. Delete

Remove the remembered connected-account record from SkillTrail.

This does **not** delete the actual X/LinkedIn account.

### Multiple accounts

A user can have distinct external accounts:

```text
user_id + X + platform_user_id_A
user_id + X + platform_user_id_B
```

These represent different external identities.

---

# Part 20 — Scheduling Specification

**Status:** LOCKED for V1

## Scope

Scheduling applies independently to LinkedIn and X publications.

The core distinction is:

```text
Draft = mutable working state
Scheduled Publication = approved publish state
Publication = execution/history state
```

A scheduled publication must not silently change merely because the underlying draft is edited.

---

# Q1. What exactly should be scheduled?

**Decision: C — Snapshot by default + explicit update**

When the user schedules a draft, SkillTrail creates an approved scheduled snapshot.

```text
Current Draft
    ↓
Schedule
    ↓
Immutable Scheduled Snapshot
```

Later edits to the current draft do not silently modify the scheduled publication.

---

# Q2. What happens when the user chooses “Update scheduled post”?

**Decision: C — Replace the scheduled snapshot, but ask for confirmation**

The user can explicitly replace the scheduled version with the current draft.

Example:

```text
Scheduled version → Version A
Current draft     → Version B

[Update scheduled post to this draft]
```

SkillTrail asks for confirmation before replacing the scheduled snapshot.

The existing scheduled time remains unless the user separately changes it.

---

# Q3. What happens when the user edits a scheduled draft?

**Decision: A — Keep the originally scheduled version**

Only an explicit update action changes the scheduled publication.

Recommended UX:

```text
⚠ Scheduled version differs from current draft

Scheduled version: Version A

Your current draft has newer changes.

[Update scheduled post to this draft]
[Keep scheduled version]
```

This gives the user a visible indication of which version will actually publish.

---

# Q4. Should scheduled posts be editable from the scheduling/history UI?

**Decision: B — Yes, but editing creates an explicit replacement flow**

A scheduled publication can expose an edit action.

The user can edit the underlying draft, but that edit does not automatically change the scheduled snapshot.

The resulting flow is:

```text
Scheduled Post
      ↓
Edit
      ↓
Current Draft changes
      ↓
Scheduled version differs
      ↓
Explicit replacement confirmation
```

---

# Q5. What does “Cancel scheduled post” do?

**Decision: A — Cancel publication only**

Cancelling a schedule does not delete or modify the draft.

```text
Scheduled Publication
        ↓
      Cancel
        ↓
Publication = cancelled
Draft = remains
```

Draft lifecycle remains separate. Drafts can later be archived or deleted from the Drafts UI.

---

# Q6. Can a scheduled publication be rescheduled?

**Decision: B — Yes, but require confirmation**

The user can change the scheduled date/time, but the new schedule must be explicitly confirmed.

Example:

```text
Tomorrow 8:00 PM
        ↓
Reschedule
        ↓
Tomorrow 10:00 PM
        ↓
Confirm
```

Rescheduling changes the timing of that scheduled publication; it does not imply an unrelated draft edit.

---

# Q7. What happens when publishing fails?

**Decision: B — Retry automatically first, then mark failed if retries are exhausted**

The publishing workflow is retryable.

```text
Scheduled
   ↓
Publishing
   ↓
Temporary failure
   ↓
Automatic retry
   ↓
Automatic retry
   ↓
Success
```

If the retry policy is exhausted:

```text
PUBLISH_FAILED
```

The underlying draft/content remains available.

---

# Q8. What happens if the social account is disconnected before the scheduled time?

**Decision: A — `publish_failed`**

If the scheduled publication cannot run because the connected account was disconnected, the publication becomes:

```text
PUBLISH_FAILED
```

The failure should retain the reason so the user can understand that account disconnection prevented publication.

The underlying draft/content remains available.

---

# Q9. Can the same composition be scheduled more than once?

**Decision: C — Yes, each scheduled publication requires an independent snapshot**

A single composition/draft can have multiple scheduled publications for the same platform.

Example:

```text
Composition
   └── LinkedIn Draft
          ├── Schedule #1 → Monday 8 PM
          │       └── Snapshot A
          │
          └── Schedule #2 → Friday 8 PM
                  └── Snapshot B
```

Each scheduled publication owns an independent approved snapshot.

Changing one scheduled publication must not mutate another scheduled publication's snapshot.

---

# Q10. What should be included in the scheduled snapshot?

**Decision: D — Hybrid snapshot**

At scheduling time, SkillTrail freezes everything required to reproduce the exact approved publication, without blindly duplicating unrelated draft state.

Conceptually:

```text
Scheduled Snapshot
├── publishable text
├── selected publishing media + ordering
├── platform-specific publishing data
├── X reply / quote target when applicable
├── X thread structure when applicable
└── other data required to reproduce the approved publication
```

The underlying draft remains mutable and can continue evolving independently.

The scheduled snapshot is what the publishing job uses.

---

# Scheduling State Model

The scheduled publication lifecycle should conceptually support:

```text
SCHEDULED
    ↓
PUBLISHING
    ↓
PUBLISHED
```

Failure path:

```text
SCHEDULED
    ↓
PUBLISHING
    ↓
retry
    ↓
PUBLISH_FAILED
```

Cancellation path:

```text
SCHEDULED
    ↓
CANCELLED
```

Account-disconnection failure is represented as `PUBLISH_FAILED` with an explanatory failure reason.

---

# Version Relationship

The central rule is that there are two independently mutable concepts:

```text
Current Draft
─────────────
User continues editing here.

Scheduled Snapshot
──────────────────
Immutable approved publish state.
```

A draft edit creates a version mismatch but does not change the scheduled publication.

The scheduled version changes only through an explicit, confirmed update action.

---

# Schema Design Implications

These decisions imply that the eventual schema must be able to represent:

1. A mutable draft.
2. A scheduled publication associated with a social connection/platform.
3. An immutable publish snapshot belonging to that scheduled publication.
4. Multiple independent scheduled publications from the same composition/draft.
5. Publication lifecycle states including scheduled, publishing, published, cancelled, publish_failed, and later deletion-related states defined by the main product decision record.
6. Retry/error metadata for publishing failures.
7. A way to identify the scheduled snapshot versus the current mutable draft.
8. Explicit user-driven replacement of the scheduled snapshot.

These are schema implications, not a commitment to specific table names or column names yet.

---


---

# Part 21 — AI Undo & Versioning Specification

**Status:** LOCKED for V1

# 1. Scope

This specification covers **AI-generated mutations to drafts**.

It does **not** introduce full revision history for ordinary manual editing.

The core distinction is:

```text
Manual edit history
❌ Not stored

AI generation/version history
✅ Stored in V1
```

AI generations are treated as meaningful versions that the user can review, compare, and restore.

---

# 2. Core V1 Rules

## 2.1 AI-only undo/versioning

Undo/versioning in V1 exists for **AI mutations**.

Manual edits do not create entries in the AI version history.

---

## 2.2 AI operations modify the current draft through a review step

When the user asks AI to modify a draft:

```text
Current accepted draft
        ↓
AI operation
        ↓
AI-generated proposal
        ↓
Review / acceptance step
```

The generated proposal is not silently treated as accepted final content.

The user must explicitly decide what to do with the AI proposal.

---

## 2.3 User cannot continue normal manual editing while an AI proposal is awaiting acceptance

While an AI mutation is in its review/acceptance state:

```text
AI proposal pending
       ↓
Accept
or
Reject / Undo
```

The user does not continue manual editing of the draft until the AI result is accepted/rejected.

This prevents ambiguous state such as:

```text
AI proposal pending
+
manual edits
+
accept/reject
```

being mixed together.

---

# 3. AI Proposal Review Flow

## 3.1 Generate

Example:

```text
Current Draft A

"I built an OAuth system."

        ↓
User:
"Make it more casual"

        ↓

AI Proposal B

"I recently built an OAuth system..."
```

The proposed AI result is persisted so the user can safely review it.

---

## 3.2 Accept

```text
Proposal B
    ↓
Accept
    ↓
B becomes the current accepted draft version
```

Once accepted:

- the AI generation is marked as an **accepted AI version**
- the persistent pending Undo action disappears
- the user can continue normal editing
- scheduling becomes available if all other scheduling requirements are satisfied

---

## 3.3 Reject / Undo

If the user does not want the proposal:

```text
Proposal B
    ↓
Reject / Undo
    ↓
previous accepted state remains current
```

The rejected AI generation remains part of AI generation history.

It is not silently discarded.

---

# 4. Undo Semantics

## 4.1 Undo means "undo this AI operation"

Undo does not mean:

> undo an arbitrary text field

or:

> undo manual editing.

It means:

> **Reverse the state changes made by this specific AI operation.**

---

## 4.2 Scope of an undo

Undo restores the pre-AI values of the fields that the AI operation actually changed.

Example:

```text
Before AI
────────────────────────
body = A
media = [1, 2]
settings = X

AI operation changes
────────────────────────
body only

Undo
────────────────────────
body → A
media remains [1, 2]
settings remains X
```

Therefore the implementation should not restore unrelated fields merely because they were part of the draft.

---

## 4.3 Undo availability

The immediate Undo action exists while the AI proposal is awaiting acceptance.

After the user accepts the AI proposal:

```text
Accept
   ↓
current accepted version
   ↓
pending Undo disappears
```

Undo is not intended to become a general-purpose manual editor undo system.

---

# 5. Redo

The user explicitly chose to provide **Redo** because they want to compare the previous state and the AI-generated state.

The AI review/history model therefore supports comparison and the ability to move between the relevant AI-generated states during the AI review flow.

The persistent history remains available even after the immediate undo/redo controls disappear.

---

# 6. AI Generation History

## 6.1 AI history is a V1 feature

SkillTrail V1 stores AI generation history.

It is not merely an internal debugging log.

The history is user-meaningful because the user can:

- view AI generations
- compare versions
- restore older AI generations

---

## 6.2 AI history is per draft

Each draft has its own independent AI-generation history.

```text
LinkedIn Draft
 └── AI Generation History

X Draft
 └── AI Generation History
```

An AI operation on one draft must never affect the history/undo state of another draft.

---

## 6.3 AI generation history is immutable for the lifetime of the draft/content

Individual AI generations cannot be deleted by the user.

Example:

```text
AI History
────────────────────────
Generation C   ✓ Accepted
Generation B   ✓ Accepted
Generation A   Rejected
```

The history remains available while its owning draft/content exists.

---

## 6.4 Deleting the owning draft/content deletes its AI generations

Although individual generations cannot be deleted independently:

```text
Delete Draft / owning Content
        ↓
Associated AI generations are deleted
```

This keeps AI-generation lifecycle tied to the lifecycle of the underlying SkillTrail data.

---

# 7. AI Generation States

An AI generation should distinguish at least the meaningful lifecycle outcomes required by the product:

```text
pending
accepted
rejected
```

A failed AI operation is still useful for internal observability and may be represented in the implementation, but the user-facing history is primarily concerned with generated proposals/versions.

---

# 8. Accepted AI Versions

When the user accepts an AI generation:

```text
AI generation
     ↓
accepted
```

it becomes an **accepted AI version**.

Accepted AI versions remain identifiable in AI history.

This allows the UI to communicate:

```text
✓ Accepted
```

and distinguish accepted versions from rejected proposals.

---

# 9. Comparing AI Versions

The user must be able to compare AI-generated versions.

Example:

```text
Previous Version
────────────────────────
"I learned three things..."

AI Version
────────────────────────
"Building this taught me three..."
```

The exact visual diff implementation can be decided in the UI implementation, but the data model must preserve enough information to support version comparison.

---

# 10. Restoring an AI Generation

## 10.1 Restore is supported

The user can select an older AI generation and choose:

```text
Restore
```

---

## 10.2 Restore requires confirmation

Restoring an older AI generation must never happen silently.

Example:

```text
Restore this AI version?

This will replace the current draft with
the selected AI-generated version.

[Cancel]
[Restore version]
```

---

## 10.3 Restoring an older version does not delete newer versions

Example:

```text
A → accepted
B → accepted
C → accepted / current

Restore A
```

Result:

```text
A becomes the current restored state
B remains in history
C remains in history
```

Older/newer AI history is not destroyed merely because a previous version is restored.

---

## 10.4 Restoring creates a new current state

Restoring an older AI generation should not rewrite history.

The selected historical generation remains historical.

The restore operation establishes a new current state derived from that generation.

This preserves the historical sequence and avoids destructive version rewriting.

---

# 11. Composition Boundary

If an AI generation belongs to an older composition state, users may still view it in AI history.

However, restoring such an older generation must follow the product's composition boundary rule:

> **Older AI generations that belong to an older composition state can be viewed, but restoration requires creating a new composition.**

This prevents a historical generation from silently rewriting the current composition identity/structure.

---

# 12. Relationship to Manual Editing

Manual editing is deliberately separate.

Example:

```text
Accepted AI Version
        ↓
User manually edits
        ↓
Current Draft
```

The manual edit itself does **not** become an AI generation.

No manual-edit revision history is stored in V1.

---

# 13. Relationship to Scheduling

AI acceptance is part of the AI-generation workflow, not a universal requirement for scheduling.

### AI-assisted path

```text
AI generation
     ↓
Review
     ↓
Accept
     ↓
Current accepted draft
     ↓
Schedule
```

### No-AI path

```text
User writes/edits manually
        ↓
No pending AI proposal
        ↓
Schedule directly
```

If an AI proposal is still pending, scheduling is not available until the AI-generation review is resolved.

---

# 14. Relationship to Scheduled Snapshots

Once scheduling occurs, the publication has its own approved publish snapshot according to Part 20.

Later AI generation/restore activity on the draft must not silently mutate the already-approved scheduled publication.

The scheduled publication changes only through the explicit scheduled-version update flow defined in Part 20.

---

# 15. AI Generation vs Undo State

These are related but distinct concepts.

## AI Generation

Represents:

> **What AI operation happened and what AI-generated version/proposal resulted from it.**

It exists for:

- version history
- comparison
- restore
- debugging
- quality analysis
- cost/usage visibility

## Immediate Undo / Review State

Represents:

> **What AI proposal is currently awaiting user acceptance/rejection and what state must be available for the current review action.**

The implementation may use a dedicated lightweight state record, snapshot fields, or another equivalent mechanism, but it must preserve the product behavior defined here.

---

# 16. Recommended Conceptual Data Model

```text
Draft
 │
 ├── current accepted state
 │
 ├── pending AI proposal / review state
 │
 └── AI Generation History
        ├── Generation A
        ├── Generation B
        ├── Generation C
        └── ...
```

Where:

```text
AI Generation
├── operation
├── model
├── prompt version
├── status
├── generated version/proposal
└── metadata
```

The exact relational breakdown belongs in the Domain & Schema Specification.

---

# 17. Version Lifecycle Example

A complete example:

```text
Draft A
  │
  │ AI: "make more casual"
  ▼
Generation B — pending
  │
  ├── Reject/Undo ───────────────┐
  │                              │
  └── Accept                     │
       │                         │
       ▼                         │
Generation B — accepted          │
       │                         │
       ▼                         │
Current Draft B                  │
       │                         │
       │ AI: "stronger hook"     │
       ▼                         │
Generation C — pending           │
       │                         │
       └── Accept                │
               │                 │
               ▼                 │
        Current Draft C          │
                                 │
AI History remains:              │
Generation B — accepted         │
Generation C — accepted         │
```

Later:

```text
User opens AI History
        ↓
Compare B and C
        ↓
Restore B
        ↓
Confirm
        ↓
B becomes restored current state
```

B and C remain in historical AI generation records.

---

# 18. V1 Non-Goals

The following are explicitly outside this specification:

- Full manual-edit revision history
- Unlimited general-purpose editor undo/redo
- Per-keystroke history
- Deleting individual AI generations
- Destructive rewriting of historical AI generations
- Automatically modifying scheduled publications because a draft changed
- Silent restoration without confirmation

---

# 19. Implementation Invariants

The coding agent should enforce these rules:

```text
INVARIANT-AI-001
AI version history is scoped to a Draft.

INVARIANT-AI-002
Manual edits do not create AI generation records.

INVARIANT-AI-003
An AI proposal requires an explicit user acceptance/rejection decision.

INVARIANT-AI-004
Normal manual editing is blocked while an AI proposal is awaiting acceptance.

INVARIANT-AI-005
Individual AI generations cannot be deleted by the user.

INVARIANT-AI-006
Deleting the owning Draft/Content removes its associated AI generations.

INVARIANT-AI-007
An accepted AI generation is identifiable as an accepted AI version.

INVARIANT-AI-008
Restoring an older AI generation requires explicit confirmation.

INVARIANT-AI-009
Restoring an older generation does not delete newer generations.

INVARIANT-AI-010
An older generation belonging to an older Composition state may be viewed,
but restoration requires creation of a new Composition.

INVARIANT-AI-011
A pending AI proposal must be resolved before scheduling.

INVARIANT-AI-012
A no-AI/manual draft can be scheduled without an AI acceptance step.

INVARIANT-AI-013
Changes to the mutable Draft do not silently mutate an approved scheduled snapshot.
```

---

# 20. Final Decision Summary

| Area | Final decision |
|---|---|
| AI undo | Undo the specific AI operation |
| Manual edit undo | Not a V1 feature |
| AI generation history | Yes, V1 |
| History scope | Per draft |
| Individual AI-generation deletion | No |
| Draft/content deletion | Deletes associated AI generations |
| AI review | Explicit acceptance/rejection |
| Manual editing while AI proposal pending | Not allowed |
| Accepted AI versions | Yes |
| Rejected AI generations | Retained in history |
| Compare AI versions | Yes |
| Restore older AI version | Yes |
| Restore confirmation | Required |
| Newer history after restore | Preserved |
| Older composition generation | Viewable; restore requires new composition |
| Immediate undo/redo UI | Supported during AI review flow |
| Undo after acceptance | Disappears |
| Scheduling with pending AI proposal | Not allowed |
| Scheduling without AI | Allowed |
| Scheduled snapshot mutation | Never silent |

---

# Final Locked Product Model After Q1–Q46

```text
USER
 │
 ├── Authentication
 │      ├── Email/password
 │      ├── Google
 │      └── Username
 │
 ├── Private Application Profile
 │      ├── name
 │      ├── username
 │      ├── experience level
 │      ├── technologies
 │      ├── interests
 │      ├── preferred platforms
 │      └── writing preferences
 │
 ├── Social Connections
 │      ├── LinkedIn account(s)
 │      └── X account(s)
 │
 ├── Media Library
 │
 ├── Content
 │      │
 │      ├── raw input/context
 │      ├── context media
 │      ├── research relationship
 │      └── discovery relationship
 │
 │      └── Post Compositions
 │             │
 │             ├── optional Angle
 │             │
 │             ├── LinkedIn Draft
 │             │      ├── text body
 │             │      └── optional publishing media
 │             │
 │             └── X Draft
 │                    ├── single post
 │                    ├── generated thread
 │                    │     ├── post 1
 │                    │     ├── post 2
 │                    │     └── post N
 │                    ├── self-reply
 │                    └── own-post quote
 │
 └── Publications
        ├── LinkedIn publication
        └── X publication
               ├── scheduled
               ├── published
               ├── publish_failed
               ├── deleted
               └── delete_failed
```

---

# Locked X Model

This is the important distinction that emerged from the X discussion:

```text
X POST
│
├── Standalone post
│
├── Reply
│     └── can be a self-reply to user's own post
│
├── Thread
│     └── multiple normal X posts
│           connected through self-replies
│
└── Quote post
      └── quotes user's own existing X post
```

A generated thread is **not** a collection of quote posts.

A self-reply is the mechanism that connects posts into a thread.

---

# Locked Media Model

```text
                    ┌── content_context_media
                    │
media ──────────────┤
                    │
                    └── post_media
                           │
                           ├── normal post
                           ├── X thread post
```

This allows the same uploaded screenshot to be:

- AI context
- publishing media
- reused in multiple compositions

---

# Locked Publication Model

A draft and an external publication are different entities.

```text
Composition
   │
   ├── Draft
   │
   └── Publication
          │
          └── External platform post
```

Therefore:

### Delete external post

```text
External X/LinkedIn post
        ↓
Delete externally
        ↓
Publication = deleted
        ↓
Draft/content remain
```

### Local content deletion

Does not automatically mean the external post has been deleted.

The two operations must not be conflated.

---

# Current V1 Product Decision Status

The previously unresolved scheduling and AI undo/versioning product decisions are now finalized.

## Scheduling

**LOCKED** — see Part 20.

Finalized behavior:

- scheduled publication uses an immutable approved snapshot
- current draft edits do not silently modify the scheduled snapshot
- updating the scheduled version is an explicit user action requiring confirmation
- a scheduled/current-version mismatch is visible to the user
- cancelling a schedule cancels only the publication; the draft remains
- rescheduling is allowed with confirmation
- publishing automatically retries before reaching `publish_failed`
- disconnecting before publish results in `publish_failed`
- the same composition can have multiple independent scheduled publications
- every scheduled publication has its own independent snapshot
- the snapshot contains everything required to reproduce the exact approved publication

## AI Undo / Versioning

**LOCKED** — see Part 21.

Finalized behavior:

- AI mutations use an explicit review/acceptance step
- manual editing is blocked while an AI proposal is pending
- Undo reverses the specific AI operation
- AI generation history is persisted per draft in V1
- manual-edit revision history is not persisted
- individual AI generations cannot be deleted
- deleting the owning draft/content deletes associated AI generations
- accepted AI generations are identifiable as accepted AI versions
- rejected generations remain in history
- users can view and compare AI generations
- older AI generations can be restored with confirmation
- restoring an older generation does not delete newer history
- restoring a generation from an older composition state requires a new composition
- immediate Undo/Redo is available during the AI review flow
- a pending AI proposal must be resolved before scheduling
- manual/no-AI drafts can be scheduled directly

---

# Remaining Work: Domain & Schema Design

No major V1 **product-behavior** decisions remain open in this record.

The next phase is the implementation-oriented domain/schema work:

1. User / Application Profile
2. Social Connections
3. Content
4. Composition / Angle / Draft
5. X-specific model
6. Media / Context Media / Post Media
7. Publication / Scheduling
8. Research
9. Discovery / Personalization
10. Consistency / Notifications
11. AI Generation / Versioning

The future `SkillTrail-domain-schema-spec.md` will translate these decisions into concrete entities, relationships, constraints, lifecycle rules, indexes, and Drizzle mappings.

---

# Explicitly Superseded Earlier Ideas

These are important so future schema work does not accidentally use an outdated decision.

### Old idea
> Attachments permanently belong to Content.

**Superseded by Q13/Q22/Q23.**

### Final
> Reusable media library with separate context-media and post-media relationships.

---

### Old idea
> X thread might simply be another way to represent multiple posts.

**Clarified by Q33.**

### Final
> A thread is a chain of normal X posts connected through self-replies.

---

### Old idea
> Deleting a publication could mean deleting local SkillTrail data.

**Clarified by Q39.**

### Final
> External deletion and local content deletion are separate operations.

---

# Future Question Rule

Do **not** reopen locked decisions unless the user explicitly asks to change them.

All V1 product-behavior decisions in this record are locked. The next work is domain/schema design (see below).
