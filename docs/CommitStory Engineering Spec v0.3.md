# Engineering Specification — CommitStory V1

**Status:** Draft v0.3 (supersedes v0.2 — aligned with PRD v0.3 and Product Decision Record v0.6, including Scheduling Part 20 and AI Undo/Versioning Part 21)  
**Purpose:** Turn CommitStory's current product decisions into concrete engineering choices, runtime boundaries, application modules, background-task responsibilities, data-flow rules, and build constraints so agentic development can proceed without repeatedly revisiting architecture or product behavior.  
**Date of Creation:** September 5, 2026  
**Product:** CommitStory

---

# 0. Authority & Scope

This document is the engineering implementation contract for CommitStory V1.

It is derived from:

```text
PRD AI Content Assistant v0.3.md
CommitStory Product Decision Record v0.6.md (includes Scheduling — Part 20 — and AI Undo/Versioning — Part 21)
```

Authority order:

```text
Product requirements / explicit user decisions
        ↓
Product Decision Record (Parts 0–21)
        ↓
This Engineering Specification
        ↓
Implementation
```

This document must not silently change product behavior defined in the decision documents.



# 1. Engineering Goals & Constraints

CommitStory V1 is optimized for:

- a solo developer
- approximately 10 validation users
- maximum initial pre-revenue investment of approximately ₹3,000
- low external API cost
- fast product iteration
- minimal operational complexity
- strong portfolio-quality engineering
- human-controlled AI assistance

The architecture must prioritize:

```text
RAW MATERIAL → CREATE → REVIEW → PREVIEW → PUBLISH
```

before adding infrastructure for future-scale workloads.

---

# 2. Final V1 Architecture

## 2.1 Architectural decision

V1 uses:

> **One Next.js application + managed Trigger.dev background execution.**

There is:

- no separate backend service
- no separate application-owned worker process
- no Redis
- no BullMQ
- no monorepo
- no Kubernetes
- no microservice split

Trigger.dev provides durable background execution without requiring CommitStory to operate its own worker infrastructure.

---

## 2.2 High-level architecture

```text
                          ┌─────────────────────────────┐
                          │       CommitStory Web         │
                          │                             │
                          │       Next.js App           │
                          │       App Router            │
                          │                             │
Browser ────────────────► │ Server Components            │
                          │ Server Actions               │
                          │ Route Handlers               │
                          │ OAuth callbacks/webhooks     │
                          │                             │
                          │ Better Auth                  │
                          │ AI abstraction               │
                          │ Domain/business logic        │
                          └──────────────┬──────────────┘
                                         │
                  ┌──────────────────────┼─────────────────────┐
                  │                      │                     │
                  ▼                      ▼                     ▼
          ┌──────────────┐      ┌────────────────┐     ┌──────────────┐
          │ Neon         │      │ Cloudflare R2  │     │ Trigger.dev  │
          │ PostgreSQL   │      │ Object Storage │     │ Tasks        │
          │ + Drizzle    │      │                │     │              │
          └──────────────┘      └────────────────┘     └──────┬───────┘
                                                               │
                                    ┌──────────────────────────┼─────────────┐
                                    │                          │             │
                                    ▼                          ▼             ▼
                              LinkedIn API                 X API        AI provider
```

Trigger.dev tasks execute outside the request/response lifecycle but use the same application domain contracts and database.

---

# 3. Runtime & Tooling Decisions

| Layer | V1 choice | Engineering rule |
|---|---|---|
| Runtime | **Bun** | Bun remains the selected local/application runtime and package manager. Avoid unnecessary Bun-specific APIs in shared domain code so deployment/task runtimes remain portable. |
| Framework | **Next.js 16 App Router** | One application serves UI, server actions, route handlers, OAuth callbacks, and normal API endpoints. |
| Language | **TypeScript, strict mode, ESM** | ESM-first. Avoid CommonJS unless a third-party package forces an isolated compatibility boundary. |
| UI | **Tailwind CSS v4 + shadcn/ui** | Components remain owned in the repository. |
| Database | **Neon PostgreSQL** | Neon is the V1 database provider. |
| ORM | **Drizzle ORM + Drizzle Kit** | Schema-as-code, migrations through Drizzle Kit. |
| Auth | **Better Auth** | Application authentication: email/password + Google + username. |
| AI | **Vercel AI SDK + Google provider** | Keep AI provider access behind an internal interface. Gemini/free-tier usage is the V1 default. |
| Background execution | **Trigger.dev** | Durable execution for scheduled/retryable/background work. |
| Object storage | **Cloudflare R2** | Store uploaded files/images; database stores metadata/references. |
| Validation | **Zod** | Shared runtime validation for inputs and AI structured output. |
| Testing | **Vitest** | Unit/integration testing. |
| Lint/format | **Biome** | Single formatting/linting tool. |
| Hosting | **Vercel** | Next.js web application deployment. |
| Package management | **Bun** | Single-package repository; no workspace/monorepo overhead. |

### Deployment portability rule

The CommitStory domain layer must not depend on Bun-only APIs.

This is especially important for Trigger.dev tasks: task code should depend on portable TypeScript/application modules rather than the Bun runtime itself.

---

# 4. Repository Structure

V1 is a **single repository / single application**, not a monorepo.

Recommended structure:

```text
CommitStory/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── home/
│   │   ├── create/
│   │   ├── discover/
│   │   ├── drafts/
│   │   ├── scheduled/
│   │   └── profile/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── oauth/
│   │   ├── ai/
│   │   ├── research/
│   │   ├── discovery/
│   │   ├── publications/
│   │   └── media/
│   │
│   └── ...
│
├── db/
│   ├── schema/
│   ├── migrations/
│   └── client.ts
│
├── lib/
│   ├── auth/
│   ├── ai/
│   ├── content/
│   ├── compositions/
│   ├── drafts/
│   ├── publishing/
│   ├── research/
│   ├── discovery/
│   ├── media/
│   ├── social/
│   ├── notifications/
│   └── validation/
│
├── trigger/
│   ├── publish/
│   ├── research/
│   ├── discovery/
│   └── consistency/
│
├── components/
├── hooks/
├── types/
├── tests/
├── public/
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

The exact directory names can change during implementation, but the architectural rule remains:

> **Domain/business logic stays outside UI components and Route Handlers; Trigger tasks call the same domain services instead of duplicating logic.**

---

# 5. Application Boundaries

## 5.1 Next.js request/response work

Keep these in the normal Next.js application:

- authentication
- onboarding
- profile CRUD
- social OAuth initiation/callback
- draft CRUD
- content CRUD
- media upload orchestration
- immediate UI reads
- normal AI generation when interactive
- AI review/accept/reject
- preview generation
- scheduling commands
- publication commands that benefit from durable execution
- user-facing history reads

---

## 5.2 Trigger.dev work

Use Trigger.dev for work that should survive the request lifecycle or execute later:

```text
1. Scheduled publishing
2. Immediate/normal publishing when retries are required
3. Publishing retries/backoff
4. Proactive consistency notifications
5. Background discovery-feed ingestion/processing
6. Research work when it becomes long-running or failure-prone
```

Trigger.dev is the execution layer.

It is **not** the domain layer.

---

## 5.3 What does NOT need Trigger.dev

Do not move every operation into a background task.

Keep these synchronous where practical:

```text
Draft CRUD
Profile updates
Auth
OAuth setup
Normal UI reads
Simple manual edits
Preview rendering
Interactive content understanding when fast enough
Interactive angle generation when fast enough
Interactive draft generation when fast enough
```

The rule is:

> Use Trigger.dev because the operation benefits from durable/background execution, not because asynchronous infrastructure is technically interesting.

---

# 6. AI Architecture

## 6.1 AI abstraction

All model calls go through a thin internal interface.

Conceptual interface:

```ts
interface AiProvider {
  understandContent(
    input: RawMaterial
  ): Promise<ContentUnderstanding>;

  generateAngles(
    input: ContentUnderstanding
  ): Promise<Angle[]>;

  generateDraft(
    input: DraftGenerationInput
  ): Promise<GeneratedDraft>;

  editDraft(
    input: DraftEditInput
  ): Promise<GeneratedDraft>;

  researchTopic(
    input: ResearchInput
  ): Promise<ResearchSynthesis>;

  understandImage(
    input: ImageInput
  ): Promise<ImageUnderstanding>;
}
```

The rest of CommitStory must not directly depend on Gemini-specific SDK calls.

---

## 6.2 V1 provider

Default:

```text
Gemini
   ↓
Google AI provider
   ↓
Vercel AI SDK
   ↓
CommitStory AI abstraction
```

The provider can later be replaced or supplemented without changing Content/Composition/Draft/Publication logic.

---

## 6.3 AI usage tracking

Every AI call that participates in the product must produce a minimal generation/usage record sufficient for:

- provider
- model
- capability/operation
- status
- latency
- token/usage information when available
- owning user/draft/context
- creation time

The V1 user-facing AI generation history is separate conceptually from purely operational metrics.

---

# 7. AI Review & Versioning Architecture

This is finalized behavior and must be implemented exactly.

## 7.1 AI mutation lifecycle

```text
Current accepted Draft
        ↓
AI operation
        ↓
Persist AI proposal
        ↓
Review
   ┌────┴─────┐
   │          │
 Accept    Reject/Undo
   │          │
   ▼          ▼
Current      Previous accepted
Draft        state remains
```

While an AI proposal is pending:

```text
Manual editing = BLOCKED
```

The proposal must survive a page refresh.

---

## 7.2 Undo

Undo means:

> Reverse the state changes made by that specific AI operation.

Only fields actually changed by the AI operation should be restored.

---

## 7.3 AI generation history

AI generation history is a V1 product feature.

Per draft:

```text
Draft
 └── AI Generation History
      ├── Generation A
      ├── Generation B
      └── Generation C
```

Users can:

- view generations
- compare generations
- restore generations

Individual AI generations cannot be deleted by the user.

If the owning draft/content is deleted, its associated AI generations are deleted.

---

## 7.4 AI generation states

At minimum:

```text
pending
accepted
rejected
```

Operational failure states may additionally be represented for observability.

---

## 7.5 Accepted AI versions

When accepted:

```text
AI Generation
     ↓
accepted AI version
     ↓
current draft state
```

Accepted generations remain identifiable in AI history.

---

## 7.6 Restore

Restoring an older AI generation:

1. shows the selected historical version
2. allows comparison with current state
3. requires explicit confirmation
4. does not delete newer AI generations
5. establishes the restored result as the current state

If the historical generation belongs to an older Composition state, it can be viewed, but restoring it requires creating a new Composition.

---

## 7.7 Undo/Redo review UI

During the AI review flow:

```text
AI proposal ready

[Compare]
[Undo / Reject]
[Accept]
```

Redo is available as part of the review interaction so the user can compare the previous accepted state with the AI-generated state.

Once the proposal is accepted, the immediate pending Undo action disappears.

---

# 8. Core Domain Model

The final relational schema is intentionally deferred to `CommitStory-domain-schema-spec.md`.

The engineering contract is:

```text
User
 │
 ├── Application Profile
 │
 ├── Social Connections
 │
 ├── Media
 │
 ├── Content
 │     └── Composition
 │            ├── optional Angle
 │            ├── Draft
 │            │    └── AI Generation History
 │            └── Publication(s)
 │
 ├── Research
 │
 ├── Discovery personalization
 │
 └── Notifications
```

---

# 9. Content → Composition → Draft → Publication

This is the central content architecture.

```text
Content
   ↓
Composition
   ↓
Platform Draft
   ↓
Publication
```

## Content

The user's underlying material/context.

Examples:

- raw notes
- what they built
- lessons
- uploaded context
- research/discovery context

One user submission represents one Content item.

---

## Composition

A specific social-content creation derived from Content.

One Content can have multiple Compositions.

Examples:

```text
Content:
"I built an AI coding assistant"

Composition A:
"How I built it"

Composition B:
"What I learned"

Composition C:
"The hardest engineering problem"
```

A Composition can optionally reference an Angle.

---

## Draft

A platform-specific editable version of a Composition.

V1 rule:

```text
At most one active draft per platform per composition.
```

Supported platforms:

```text
linkedin
x
```

A user can manually create a draft without using AI.

---

## Publication

A publication represents an external publishing lifecycle independently from the mutable Draft.

```text
Composition
   ├── Draft
   └── Publication
```

Deleting a Publication externally does not delete the Draft or Content.

---

# 10. X Model

## 10.1 Supported X composition types

V1 supports:

```text
1. Standalone post
2. Reply to an existing post
3. Self-reply
4. Generated thread
5. Quote user's own post
```

A generated thread is a chain of normal X posts connected through self-replies.

A quote post is a distinct concept.

---

## 10.2 Existing X posts

After connecting X, CommitStory can work with the user's actual recent X posts, including posts created outside CommitStory.

The existing-post picker supports:

```text
Recent posts
Pagination
Search
```

Used for:

```text
Reply
Quote
Continue thread
```

---

## 10.3 Thread editing

Each thread post has its own editable content.

Users can:

```text
Add
Edit
Delete
Reorder
```

The thread itself can be scheduled as one unit.

---

## 10.4 Thread regeneration

Support both:

```text
Regenerate individual thread post
```

and:

```text
Regenerate entire thread
```

---

## 10.5 X character capability

X character limits must not be hard-coded as a single global value.

The effective limit should depend on the capabilities of the connected X account.

During account connection/synchronization:

```text
X account
    ↓
retrieve available account capability/subscription information
    ↓
store relevant capability snapshot
    ↓
derive effective posting constraints
```

The UI provides a live counter and prevents publishing content that violates the effective platform limit.

Do not bake assumptions such as a fixed “Premium = X characters” value into the schema.

---

## 10.6 No-AI X workflow

AI is optional.

The user must be able to choose:

```text
Use AI to restructure/compose
```

or:

```text
Post my content without AI intervention
```

The no-AI path can proceed directly from a user-authored draft to preview/publish/schedule.

---

## 10.7 P1 external thread import

Importing/understanding existing X threads created outside CommitStory is P1.

---

# 11. LinkedIn V1 Model

LinkedIn V1 intentionally remains simple.

```text
User context
    ↓
AI writes LinkedIn text
    ↓
User edits
    ↓
Optional publishing media
    ↓
LinkedIn preview
    ↓
Publish / Schedule
```

V1 does not include the carousel/document-post editor.

Normal LinkedIn posts can include user-selected publishing media.

---

# 12. Media Architecture

Use a reusable media library.

Conceptually:

```text
Media Asset
     │
     ├── Content Context Relationship
     │       └── AI input
     │
     └── Publication/Draft Media Relationship
             └── appears on social post
```

The same uploaded asset can serve both roles.

The database stores metadata and storage references.

Binary files live in R2.

Do not store binary file contents directly in PostgreSQL.

---

# 13. Preview & Verification

V1 requires a platform-specific preview before publishing/scheduling.

Supported preview modes:

```text
X:
- normal post
- reply
- quote
- thread

LinkedIn:
- normal post
```

The preview should simulate the platform presentation.

It should also surface:

- effective character limits
- line-break/formatting behavior
- attached media
- platform-specific relationships

The preview is a verification gate:

```text
Draft
  ↓
Preview
  ↓
User verifies
  ↓
Publish / Schedule
```

A user must not accidentally publish directly from an unverified editor state.

---

# 14. Publishing Architecture

## 14.1 Immediate publishing

Even immediate publishing uses the durable publishing execution path when retries are required.

Conceptually:

```text
User clicks Publish
       ↓
Create publication record
       ↓
Create immutable publish snapshot
       ↓
Trigger.dev publish task
       ↓
LinkedIn/X API
       ↓
Success or retry
```

The request does not need to stay open while external publishing is being retried.

---

## 14.2 Scheduled publishing

```text
Current Draft
       ↓
User verifies
       ↓
Schedule
       ↓
Create independent immutable scheduled snapshot
       ↓
Create scheduled Publication
       ↓
Trigger.dev waits until scheduled time
       ↓
Publish
```

The scheduled job publishes from the snapshot, not from the mutable current draft.

---

## 14.3 Scheduled/current-draft mismatch

If the user changes the current Draft after scheduling:

```text
Scheduled Version = A
Current Draft     = B
```

CommitStory shows:

```text
⚠ Scheduled version differs from current draft

[Update scheduled post to this draft]
[Keep scheduled version]
```

Updating the scheduled publication requires confirmation.

---

## 14.4 Multiple schedules

One Composition/Draft can have multiple scheduled publications.

Each scheduled Publication owns its own independent snapshot.

```text
Draft
 ├── Schedule A
 │      └── Snapshot A
 │
 └── Schedule B
        └── Snapshot B
```

Updating Snapshot B must not affect Snapshot A.

---

# 15. Publication State Model

Conceptual lifecycle:

```text
SCHEDULED
    ↓
PUBLISHING
    ↓
PUBLISHED
```

Failure:

```text
SCHEDULED
    ↓
PUBLISHING
    ↓
automatic retries
    ↓
PUBLISH_FAILED
```

Cancellation:

```text
SCHEDULED
    ↓
CANCELLED
```

Later deletion:

```text
PUBLISHED
    ↓
delete requested
    ↓
DELETED
```

Failure deleting externally:

```text
PUBLISHED
    ↓
delete request
    ↓
DELETE_FAILED
```

The exact status enum and table representation belong in the domain/schema specification.

---

# 16. External Post Deletion

Deleting an externally published post is a separate action from deleting local CommitStory data.

Example:

```text
CommitStory Draft
      │
      └── Publication
              │
              └── X post
```

User chooses:

> Delete from X

Result:

```text
X post → deleted externally
Publication → records deleted state
Draft → remains
Content → remains
Media → remains
AI history → remains
```

If deletion fails:

```text
Publication → DELETE_FAILED
```

and the user can retry.

---

# 17. Publication Status Synchronization

V1 does not continuously synchronize every external publication.

Normal history can use locally stored state.

When the user opens/interacts with a publication:

```text
refresh external status when appropriate
```

Important/destructive actions such as external deletion should verify the current platform state.

This keeps API usage reasonable while making user actions trustworthy.

---

# 18. Social Account Lifecycle

A social connection is an application publishing authorization, not a Better Auth login identity.

Logical identity:

```text
user_id + platform + platform_user_id
```

Lifecycle:

```text
Connected
   ↓
Disconnected
   ↓
Remembered connection
   ├── Reconnect
   └── Delete from CommitStory
```

Disconnecting does not erase history.

Deleting the remembered connection does not delete the real social account.

Multiple external accounts per user are supported when they have different external platform identities.

---

# 19. Better Auth Boundary

Better Auth owns application authentication.

V1 application authentication:

```text
Email/password
Google
Username
```

Keep Better Auth's authentication records separate from CommitStory's publishing authorization records.

Conceptually:

```text
Better Auth
├── user
├── session
├── account
└── verification / auth-related data

CommitStory
└── social_connection
```

Do not repurpose Better Auth's authentication `account` record as the storage model for LinkedIn/X publishing tokens.

No payment plugin/infrastructure is required in V1.

No public CommitStory profile/social-network layer is required in V1.

---

# 20. Research Architecture

## 20.1 Research

A research session should retain:

```text
query
sources
source metadata
synthesis
possible content angles
timestamps/status
```

When a user turns research into Content:

```text
Research
   ↓
Content
   ↓
Composition
```

The Content retains traceability back to the research session.

---

## 20.2 Trigger.dev use

Specific research may execute synchronously if small/fast enough.

Use Trigger.dev when research becomes:

- long-running
- multi-source
- retry-prone
- rate-limit sensitive
- otherwise unsuitable for the request lifecycle

This should be decided from workload characteristics rather than forcing all research into background jobs.

---

# 21. Discovery Feed Architecture

Discovery uses:

```text
global discovery items
        +
user personalization
```

The feed must not perform a fresh AI research call every time a user opens the Discover screen.

Instead:

```text
Trigger.dev background ingestion
          ↓
discoverable global items
          ↓
summaries/context
          ↓
user-specific ranking/personalization
          ↓
Discover UI
```

Specific user research remains a separate workflow.

---

# 22. Proactive Consistency Notifications

V1 includes proactive consistency notifications.

Channels:

```text
In-app
+
Email
```

A daily Trigger.dev task:

```text
Daily task
   ↓
inspect recent publication activity
   ↓
calculate inactivity
   ↓
threshold crossed?
   ├── no → nothing
   └── yes
         ↓
create notification
         ↓
send email
```

The consistency feature is encouragement, not aggressive gamification.

Posting history should be the source of truth for activity metrics.

Avoid maintaining a second independent “streak truth” unless later analysis proves it necessary.

---

# 23. Notification Architecture

Conceptually:

```text
notification
├── user_id
├── type
├── title/body or payload
├── read state
├── created_at
└── optional delivery metadata
```

Email delivery should be abstracted so a future email provider can be swapped.

The exact notification/email tables belong in the schema specification.

---

# 24. Data Ownership & Security

Every user-owned entity must be scoped to the authenticated user or an unambiguous ownership chain.

The engineering rule is:

> Never fetch a user-owned object by ID alone when authorization can be checked through ownership.

OAuth credentials:

- never exposed to browser/client code
- encrypted at rest
- accessed only by server-side publishing code
- rotated/replaced when reauthorization occurs where supported

Raw user content may contain unpublished project information.

V1 must document a basic data-retention/privacy stance before onboarding real users.

---

# 25. AI Safety & Factuality

The system distinguishes:

```text
User-provided facts
        +
Researched information
        +
AI-generated framing
```

AI output must not silently invent:

- project capabilities
- metrics
- benchmarks
- personal experiences
- technical claims
- outcomes

For researched content:

```text
Claim
 ↓
Source retained
 ↓
User can inspect/verify
```

---

# 26. Failure & Retry Principles

Use different handling for different classes of failure.

## User-editable AI failure

Keep the prior accepted draft intact.

```text
AI request fails
     ↓
Current accepted draft remains
     ↓
Retry
```

## Publishing failure

Trigger.dev handles automatic retry/backoff.

After exhaustion:

```text
PUBLISH_FAILED
```

with a user-visible reason.

## External delete failure

```text
DELETE_FAILED
```

with retry available.

## Account-disconnect publishing failure

```text
PUBLISH_FAILED
reason = account disconnected
```

The draft/content remains available.

---

# 27. Cost Controls

The V1 budget requires aggressive cost discipline.

## AI

- free hosted AI tier first
- track usage
- avoid per-keystroke AI calls
- debounce where appropriate
- cache/reuse generation results when possible
- add paid/fallback providers only after real quota pressure

## Infrastructure

Preferred free/low-cost services:

```text
Vercel
Neon
Cloudflare R2
Trigger.dev free tier
Gemini/free AI tier
```

Avoid:

```text
GPU rental
self-hosted model inference
Redis
BullMQ
Kubernetes
separate worker server
```

until actual user usage justifies them.

---

# 28. Testing Strategy

Testing must follow the domain boundaries.

## Unit tests

Target:

- Content understanding normalization
- angle selection
- draft transformations
- X constraint calculation
- publication snapshot generation
- scheduling mismatch detection
- ownership checks
- notification threshold logic

## Integration tests

Target:

- Better Auth → application user
- social OAuth connection lifecycle
- database relations
- publication state transitions
- Trigger task → publication flow
- AI generation persistence
- AI accept/reject/restore
- media metadata/object storage interaction

## E2E tests

At minimum:

```text
Signup
  ↓
Connect platform
  ↓
Create content
  ↓
Generate
  ↓
Accept AI result
  ↓
Preview
  ↓
Publish
```

and:

```text
Create
  ↓
Schedule
  ↓
Edit current draft
  ↓
Mismatch banner
  ↓
Update scheduled version
  ↓
Publish from approved snapshot
```

and:

```text
AI edit
  ↓
Review
  ↓
Reject/Undo
  ↓
Accepted draft unchanged
```

---

# 29. Build Order

The build order now reflects the finalized product behavior.

## Phase 1 — Foundations

```text
Next.js
Bun
Better Auth
Neon
Drizzle
R2
Trigger.dev
Zod
Vitest
Biome
```

Get authentication and empty dashboard working.

---

## Phase 2 — Content foundation

```text
Create input
      ↓
Content persistence
      ↓
Media uploads
      ↓
Content understanding
      ↓
Angles
```

---

## Phase 3 — Drafts

```text
Composition
      ↓
LinkedIn draft
      ↓
X draft
      ↓
Manual editing
      ↓
Draft persistence
```

---

## Phase 4 — AI review/versioning

Implement before advanced publishing:

```text
AI edit
 ↓
Proposal
 ↓
Accept / Reject
 ↓
AI history
 ↓
Compare
 ↓
Restore
```

This phase is required because AI mutation is no longer a simple “replace text” operation.

---

## Phase 5 — Preview

Implement:

```text
LinkedIn preview
X preview
character constraints
media preview
verification gate
```

---

## Phase 6 — Publishing

First:

```text
Immediate LinkedIn
Immediate X
```

Then:

```text
X reply
X quote
X thread
```

and external post selection.

---

## Phase 7 — Scheduling

Implement:

```text
Publication
Scheduled Snapshot
Trigger.dev task
Retry
Cancel
Reschedule
Mismatch banner
Explicit snapshot update
```

---

## Phase 8 — Drafts & history

Implement:

```text
Draft library
Publication history
Failed publishing states
External deletion
```

---

## Phase 9 — Discover

First:

```text
Global discovery ingestion
```

Then:

```text
Personalized feed
```

Then:

```text
Specific research
```

Then:

```text
Research → Content
```

---

## Phase 10 — Consistency

```text
Posting metrics
      ↓
Daily Trigger.dev task
      ↓
In-app notification
      +
Email
```

---

# 30. V1 Explicitly Excluded

Do not implement these in V1:

- LinkedIn carousel/document builder
- PDF document editor
- AI image generation
- video generation
- autonomous content decisions
- full long-term AI memory
- Day 1 → Day 100 knowledge graph
- advanced analytics
- automatic content strategy
- Instagram/Threads/Facebook/TikTok/YouTube
- enterprise/team features
- public CommitStory social profiles
- payment/billing infrastructure
- self-hosted AI/GPU infrastructure
- Redis/BullMQ
- separate worker service
- monorepo

---

# 31. Engineering Decisions That Are Now Closed

The following are no longer architecture questions to reopen during implementation:

```text
Next.js full-stack app
Bun
Single repository
No monorepo
No separate worker process
Trigger.dev
No Redis
No BullMQ
Neon
Drizzle
Better Auth
Cloudflare R2
Vercel AI SDK
Gemini/free hosted AI default
Vercel hosting
```

The reason to revisit one of these later must be a concrete implementation/workload problem, not preference drift.

---

# 32. Product Decisions Now Reflected in Engineering

The engineering implementation must preserve:

```text
Content
   ↓
Composition
   ↓
Draft
   ↓
Publication
```

and:

```text
Draft = mutable working state

Scheduled Snapshot = immutable approved publish state
```

and:

```text
AI Proposal
   ↓
Accept / Reject
```

and:

```text
AI History = user-visible V1 capability
Manual revision history = not stored
```

and:

```text
External publication deletion
        ≠
Local Content/Draft deletion
```

and:

```text
Disconnect social account
        ≠
Delete social account history
```

---

# 33. Remaining Engineering Work After v0.3

Major **product behavior** decisions are now closed.

The next engineering artifact should be:

```text
CommitStory-domain-schema-spec.md
```

That document must define:

```text
Entity inventory
Relationships
Foreign keys
Ownership
Enums
State machines
Delete/cascade policies
Unique constraints
Indexes
AI-generation/version storage
Scheduled snapshot storage
X thread structure
Media relationships
Notification records
Research/discovery relations
Drizzle mapping
```

The schema document should be created only after the domain relationships have been deliberately reviewed; implementation should not invent tables simply because they seem useful.

---

# 34. Agentic Development Rules

When an AI coding agent implements CommitStory:

## Must

- follow this specification and the Product Decision Record
- preserve existing product semantics
- enforce ownership checks
- use Zod for externally supplied data
- use database transactions where multiple related records must change atomically
- make Trigger.dev publishing tasks idempotent
- keep external API calls isolated behind platform clients
- keep AI calls behind the internal AI abstraction
- create migrations for database changes
- add tests for state transitions and destructive operations

## Must not

- reintroduce NestJS
- reintroduce a separate Express/Fastify backend without a demonstrated requirement
- create a worker process just because Trigger.dev tasks exist
- introduce Redis/BullMQ
- move all synchronous UI work into Trigger.dev
- directly call X/LinkedIn APIs from React/client components
- store OAuth tokens in client-visible objects
- silently modify scheduled snapshots
- silently mutate drafts when an AI proposal is pending
- create full manual revision history
- implement carousel/PDF features in V1
- add payment infrastructure “for later”
- invent unapproved product behavior

---

# 35. Definition of Done for the Core V1 Loop

The core system is ready for real-user validation when a user can complete:

```text
Sign up
   ↓
Connect LinkedIn/X
   ↓
Open Create
   ↓
Dump notes/context
   ↓
Optional screenshots/files
   ↓
AI understands content
   ↓
Choose angle OR skip angle
   ↓
Generate LinkedIn/X draft(s)
   ↓
Edit manually
   ↓
Use AI edit
   ↓
Review AI proposal
   ↓
Accept / Reject
   ↓
Compare AI versions when needed
   ↓
Preview platform rendering
   ↓
Publish now
   OR
Schedule
   ↓
Reliable publication / retry
   ↓
See result in history
```

A secondary validation loop should also work:

```text
Open Discover
   ↓
See personalized development
   ↓
Research specific topic
   ↓
Create Content
   ↓
Generate post
   ↓
Preview
   ↓
Publish / Schedule
```

And the consistency loop:

```text
User stops posting
      ↓
Daily Trigger.dev check
      ↓
Threshold crossed
      ↓
In-app + email reminder
      ↓
Create
```

---

# 36. Final Architecture Statement

CommitStory V1 is intentionally a **single Next.js application backed by Neon, R2, Better Auth, hosted AI APIs, and Trigger.dev**.

The system does not need a separate application-owned backend or worker at V1 scale.

The important architectural separation is not “services everywhere”; it is:

```text
UI / Request Layer
        ↓
Domain Layer
        ↓
Persistence / External Clients
        ↓
Trigger.dev for durable/background execution
```

This gives CommitStory enough structure to demonstrate production-grade engineering while keeping the system small enough for a solo developer to build, operate, and iterate within the initial budget.

