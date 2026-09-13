# SkillTrail — Domain & Schema Specification v1.0

**Status:** LOCKED — synchronized with the provided `SkillTrail-Schema-Spec-v1.0.md`  
**Purpose:** Canonical domain/database contract for SkillTrail V1. This document records the finalized entities, ownership model, relationships, lifecycle rules, constraints, indexes, deletion behavior, transaction boundaries, and Drizzle/PostgreSQL decisions that the implementation must follow.  
**Date of Creation:** September 6, 2026  
**Product:** SkillTrail

---

# 0. Authority & Source

This version is regenerated from the supplied finalized schema specification and the current engineering/product decisions.

Primary sources:

```text
SkillTrail Product Decision Record v0.6
SkillTrail Engineering Spec v0.3
SkillTrail-Schema-Spec-v1.0.md
```

The supplied finalized schema states that the target is PostgreSQL on Neon with Drizzle ORM v1 and the Relations v2 API, and that the Drizzle schema/relations are intended to be direct translations of this database/domain contract. fileciteturn29file0L3-L8

Authority order:

```text
Product requirements / locked product decisions
        ↓
Product Decision Record
        ↓
Engineering Specification
        ↓
Finalized Schema Specification
        ↓
This Domain & Schema Specification
        ↓
Drizzle schema + migrations
```

This document does not introduce new product features.



# 2. Final Entity Inventory

The finalized schema defines the following inventory. fileciteturn29file0L17-L31

| Domain | Tables |
|---|---|
| Auth — Better Auth-owned | `user`, `session`, `account`, `verification` |
| Profile | `application_profile`, `technology`, `user_technology`, `interest`, `user_interest` |
| Social | `social_connection` |
| Content | `content`, `content_context_media`, `angle` |
| Composition | `composition`, `draft` |
| X-specific | `x_thread_post`, `x_external_post` |
| Media | `media`, `draft_media` |
| Publishing | `publication` |
| AI | `ai_generation` |
| Research | `research`, `research_source` |
| Discovery | `discovery_item`, `user_discovery_item` |
| Notifications | `notification`, `notification_preference` |

### Count

```text
4 Better Auth-owned tables
23 SkillTrail-owned tables
27 total tables in the inventory
```

This count is canonical. Do not use an older “25 SkillTrail-owned tables” figure.

---

# 3. Core Domain Model

```text
Better Auth User
      │
      ├── Application Profile
      ├── Social Connections
      ├── Media Library
      ├── Content
      │     └── Composition
      │            └── Draft
      │                   ├── AI Generation History
      │                   └── X-specific structure where applicable
      │
      ├── Research
      ├── Discovery Personalization
      ├── Notifications
      └── Publications
```

Central content model:

```text
Content
   ↓
Composition
   ↓
Draft
   ↓
Publication
```

State separation:

```text
Draft
= mutable working state

AI Generation
= persisted AI proposal/version history

Scheduled Publication Snapshot
= immutable approved publish state

Publication
= external publication lifecycle/history
```

---

# 4. Better Auth Boundary

`user`, `session`, `account`, and `verification` are Better Auth-owned and generated through the Better Auth CLI. They are mirrored for FK/type integration only and are not independently maintained as a second authentication system. fileciteturn29file0L40-L44

The username plugin provides `username` and `displayUsername` on Better Auth's `user` table. SkillTrail must not duplicate them onto `application_profile`. fileciteturn29file0L42-L44

Every SkillTrail-owned user reference is a `text` FK to Better Auth `user.id`.

The supplied Better Auth/Drizzle documentation also establishes that Better Auth can generate the auth schema, and that Relations v2 uses `defineRelationsPart` for the generated auth relations. The application relations and generated auth relations are merged into the Drizzle configuration. fileciteturn25file2L313-L379 fileciteturn25file4L580-L603

---

# 5. Module 2 — Application Profile

## Final model

`application_profile` is a 1:1 table with Better Auth `user`.

It stores only SkillTrail-specific personalization.

```text
application_profile
├── experience_level
├── preferred_platforms
├── writing_tone
├── technical_depth
├── emoji_usage
└── writing_instruction
```

Technologies and interests use normalized catalogs plus user junction tables:

```text
technology
   ↑
user_technology
   ↓
user
```

```text
interest
   ↑
user_interest
   ↓
user
```

Suggested and custom values share the same catalog tables. Custom values are distinguished with `isCustom` and `createdByUserId`, and catalog names are unique case-insensitively. The supplied finalized schema explicitly makes this a global reusable catalog decision. fileciteturn29file0L48-L52

### Important source assumptions preserved

The supplied finalized schema labels two profile details as assumptions rather than upstream-locked facts:

1. Custom technologies/interests become globally visible catalog suggestions.
2. The exact enum labels for writing preferences are implementation-selected defaults.

These assumptions are preserved from the source and should be considered part of the schema contract unless explicitly superseded before migrations. fileciteturn29file0L48-L52

---

# 6. Module 3 — Social Connections

## Final table

```text
social_connection
```

One unified table represents both:

```text
platform = x
platform = linkedin
```

## Identity

The canonical uniqueness constraint is:

```text
UNIQUE(platform, platform_user_id)
```

That is the **global external-identity ownership** rule:

- An X or LinkedIn account can belong to only one SkillTrail user.
- The same SkillTrail user may have multiple accounts on the same platform, because `user_id` is **not** part of this unique constraint.

Examples:

```text
User A + X @foo  → allowed
User A + X @bar  → allowed
User B + X @foo  → not allowed
User A connecting @foo twice → not allowed
```

`(user_id, platform)` may be indexed for listing a user's connections. That index is **not** unique.

## Multiple accounts

A single SkillTrail user may have multiple active X/LinkedIn accounts simultaneously.

No persisted default-account column is required.

Selection behavior is derived:

```text
0 active accounts
→ connect one

1 active account
→ use automatically

2+ active accounts
→ ask user to choose
```

## Lifecycle

```text
Connected
   ├── user disconnect     → Disconnected (remembered)
   ├── token expiry        → Expired
   └── platform revocation → Revoked

Disconnected / Expired / Revoked
   ├── Reconnect → Connected
   └── Delete    → row removed
```

Disconnect is a user action. `expired` and `revoked` are operational statuses on the same enum. Deleting removes the remembered SkillTrail connection.

## Credentials

Standard fields:

```text
access_token
refresh_token
access_token_expires_at
refresh_token_expires_at
scopes
```

Credentials are:

```text
server-only
+
application-level encrypted
+
database/provider encrypted at rest
```

## External identity metadata

Persist useful account metadata:

```text
platform_user_id
platform_username
display_name
avatar reference
profile_url
```

External avatars are copied into R2 for stable presentation.

## Capability information

Use JSONB for provider-divergent capability data with a synchronization timestamp.

Capabilities are refreshed when stale.

The effective X posting constraints are account-specific rather than globally hard-coded.

## Token refresh and status

If an external publish attempt receives an authorization failure:

```text
publish
   ↓
unauthorized
   ↓
refresh token
   ↓
retry
```

If refresh + retry succeeds, `status` remains `connected`.

If it fails because the token expired, set `status = expired`.

If it fails because the platform revoked access, set `status = revoked`.

There is **no** separate health enum. One status column covers user lifecycle and operational failure:

```text
connected | disconnected | expired | revoked
```

Reconnect (user action) returns the row to `connected`. Explicit disconnect is `disconnected`. Deleting the remembered row removes it from SkillTrail.

## Disconnect + scheduled Publications

`soc​ial_connection` does not cache scheduled-publication counts.

Affected Publications are discovered by querying the Publication table.

If the user disconnects with schedules present, they must explicitly confirm. Affected scheduled Publications become visible failed/error states rather than silently disappearing. Published history remains. fileciteturn29file0L56-L59

---

# 7. Module 4 — Content

## Final table

```text
content
```

One user submission becomes one Content item.

## Origin

Persist explicit origin:

```text
manual
research
discovery
```

Also allow nullable relationships to:

```text
research_id
discovery_item_id
```

Origin is explicit rather than inferred from nullable FK presence. fileciteturn29file0L61-L66

## Processing state

Persist:

```text
raw
analyzing
understood
failed
```

This tracks Content-level AI understanding rather than the entire end-to-end posting pipeline.

## Understanding result

Store the latest AI content-understanding result as JSONB on `content`.

This is supporting/regenerable information, not a Draft review proposal, so it is not represented as an `ai_generation` row. fileciteturn29file0L63-L66

## Research relationship

A Content item may reference at most one Research session in V1.

## Discovery relationship

A Content item may reference a Discovery Item and retain that traceability without duplicating the entire Discovery record.

The user must explicitly confirm:

```text
☑ Use discovery context
```

before it participates in generation.

---

# 8. Module 5 — Angle

## Final table

```text
angle
```

An Angle is AI-generated and can originate from either Content or Research.

The relationship is exclusive:

```text
content_id IS NOT NULL
XOR
research_id IS NOT NULL
```

implemented with a CHECK constraint. fileciteturn29file0L68-L71

There is no separate manual-angle entity.

A Composition may have:

```text
angle_id = NULL
```

when the user chooses not to use an AI-generated angle.

---

# 9. Module 6 — Composition / Draft

## Composition

A Content item can produce multiple independent Compositions.

```text
Content
 ├── Composition A
 ├── Composition B
 └── Composition C
```

A Composition may remember its selected Angle.

Changing the Angle creates a new Composition.

## Draft

A Draft is the mutable platform-specific representation of a Composition.

```text
Composition
 ├── LinkedIn Draft
 └── X Draft
```

Enforced uniqueness:

```text
UNIQUE(composition_id, platform)
```

There are no archived/inactive draft rows in this model. One Draft row per Composition + platform is the source of mutable working state. fileciteturn29file0L73-L77

## AI-assisted indicator

```text
ai_assisted boolean
```

This represents whether AI has ever touched the Draft.

It does not encode the Draft's lifecycle or current source.

## AI state pointers

```text
pending_ai_generation_id
current_ai_generation_id
```

Both reference `ai_generation.id`.

They allow:

- pending AI proposals to survive refresh
- manual editing to remain blocked while a proposal is pending
- current accepted AI version to be identified

No separate proposal-state table is required. fileciteturn29file0L75-L77

---

# 10. Module 7 — X-specific Model

## X post type

`draft.x_post_type`:

```text
standalone
reply
self_reply
thread
quote
```

## Reply / quote targets

A Draft can target either:

```text
x_external_post
```

or:

```text
publication
```

using:

```text
target_external_post_id
target_publication_id
```

The meaning is determined by `x_post_type`.

## X thread

`x_thread_post` stores one row per thread item:

```text
position
body_text
```

with:

```text
UNIQUE(draft_id, position)
```

Thread posts can be added, edited, removed, and reordered.

The complete thread is scheduled as one logical Publication unit.

## External X post cache

`x_external_post` is a lightweight cache of external X content selected via the picker.

It is not a Publication.

Uniqueness:

```text
UNIQUE(social_connection_id, platform_post_id)
```

This supports:

```text
recent posts
pagination
search
reply
quote
continue-thread
```

## Thread-level AI regeneration

`ai_generation.target_x_thread_post_id` scopes an AI generation to one thread item when regenerating a single item; null means the operation applies to the whole Draft/thread. fileciteturn29file0L79-L85

---

# 11. Module 8 — Media

## Final tables

```text
media
content_context_media
draft_media
```

## Media model

One reusable `media` table with:

```text
kind = image | document
```

Binary data lives in R2.

PostgreSQL stores metadata/reference information.

## Context relationship

```text
content_context_media
```

represents media supplied as AI input/context.

## Publishing relationship

```text
draft_media
```

represents media intended to appear on a Draft/publication.

Publishing media is ordered and may optionally scope to a specific X thread post.

These are deliberately separate relationships because their semantics differ. fileciteturn29file0L87-L92

## Deletion

Deleting a Media row is restricted while it is referenced.

The user must detach all usages before deletion.

The same media asset cannot appear more than once in the same Draft or thread-post context.

---

# 12. Module 9 — Publication / Scheduling

## Final table

```text
publication
```

A Publication records an external publishing lifecycle separately from Draft state.

## Ownership

`publication.user_id` is intentionally denormalized for high-value dashboard queries such as:

```text
user + status
scheduled_for + status
```

## Draft relationship

`draft_id` is nullable and retained for traceability only.

It is **never** the source of truth for already-approved publish content.

## Composition relationship

`composition_id` is retained as the primary local lineage relationship.

The finalized schema uses `ON DELETE RESTRICT` on this relationship to protect publication history from accidental content-tree deletion. fileciteturn29file0L94-L100

## Scheduled snapshot

The approved publish state is persisted as JSONB.

It contains everything required to reproduce the exact approved publication, including as applicable:

```text
text
media references + ordering
X reply target
X quote target
X thread structure
platform-specific publishing settings
```

The snapshot is immutable under ordinary Draft edits.

An explicit scheduled-version update replaces the snapshot after confirmation.

## Publication states

```text
scheduled
publishing
published
publish_failed
cancelled
deleted
delete_failed
```

## Failure reasons

```text
account_disconnected
platform_error
rate_limited
validation_error
unknown
```

## Multiple schedules

A Draft/Composition may have multiple scheduled Publications.

Each Publication has its own independent snapshot.

## Cancellation

Cancelling a scheduled Publication leaves the Draft intact.

## Rescheduling

Allowed with confirmation.

## Retry

Trigger.dev handles automatic retries before final `publish_failed`.

## External deletion

A published external post can be deleted from SkillTrail.

The local Draft/Content remains.

Failure becomes:

```text
delete_failed
```

## Retention

Cancelled/deleted Publication records are retained as history in V1.

---

# 13. Module 10 — AI Generation / Versioning

## Final table

```text
ai_generation
```

No separate proposal/state table is required.

## Lifecycle

```text
pending
accepted
rejected
failed
```

## Operations

```text
generate_draft
edit_draft
regenerate
restore
```

Content-level AI understanding and angle generation do not become `ai_generation` rows; they populate Content understanding/Angle entities directly. fileciteturn29file0L102-L107

## Version information

The V1 finalized schema stores:

```text
before_text
after_text
```

rather than a generic multi-field diff object because V1 AI mutations are defined as text mutations on Drafts; media remains user-controlled. fileciteturn29file0L104-L107

## Restore

Restoring a historical AI generation creates a new `ai_generation` row:

```text
operation = restore
status = accepted
```

The historical record is never rewritten or deleted.

## History

Users can:

```text
view
compare
restore
```

Individual AI generations cannot be deleted.

Deleting the owning Draft/Content deletes associated AI generations.

## Thread-level target

`target_x_thread_post_id` can target a specific thread item for regeneration.

---

# 14. Module 11 — Research

## Final tables

```text
research
research_source
```

Research is a persisted session/attempt.

Failed research is represented by:

```text
status = failed
```

and retrying creates a new Research row rather than a separate execution-history table.

`research_source` stores independently queryable source information such as:

```text
url
title
snippet
fetched_at
```

The model supports source traceability for factual verification. fileciteturn29file0L109-L113

`trigger_task_id` is nullable and populated only when the Research operation runs through Trigger.dev.

---

# 15. Module 12 — Discovery / Personalization

## Final tables

```text
discovery_item
user_discovery_item
```

## Global item

`discovery_item` is global and reused across users.

`category` is plain indexed text rather than an enum because categories may evolve without a migration for every new category.

## Global deduplication

`external_key` uniquely identifies the ingested item.

It is generated from a normalized source URL or content hash at ingestion time.

## Suggested angles

Discovery-level suggested angles are stored as a simple `text[]` display field.

They are not reused as rows in the Content/Research `angle` entity because they have no per-user selection lifecycle.

## Source

V1 stores a single source URL/name pair on `discovery_item` rather than a dedicated multi-source table.

## Archive

`archived_at` removes stale items from active discovery while preserving references from Content created from them.

## User personalization

`user_discovery_item` stores user-specific state such as:

```text
seen/read
saved
dismissed
relevance/personalization data as finalized by implementation
```

The actual final fields follow the finalized Drizzle schema.

---

# 16. Module 13 — Consistency / Notifications

## Final tables

```text
notification
notification_preference
```

No separate email-delivery table is required in V1.

`notification` stores email-side state directly, including fields such as:

```text
email_status
email_sent_at
```

## Notification type

V1 currently has:

```text
consistency_reminder
```

## Duplicate prevention

The daily Trigger.dev consistency task uses persisted preference/activity timestamps to avoid repeatedly issuing the same inactivity reminder.

The user-facing channels are:

```text
in-app
+
email
```

Consistency metrics themselves remain derived from publication history rather than a second independent streak table. fileciteturn29file0L123-L127

---

# 17. Ownership Model

The finalized ownership policy is: direct `user_id` is added to root-level or high-value query resources; child records normally inherit ownership through their parent chain. fileciteturn29file0L131-L152

| Table | Ownership path | Direct `user_id`? |
|---|---|---|
| `application_profile` | own PK = FK to `user` | Yes |
| `social_connection` | → `user` | Yes |
| `media` | → `user` | Yes |
| `content` | → `user` | Yes |
| `angle` | → `content` or `research` → `user` | No |
| `composition` | → `content` → `user` | No |
| `draft` | → `composition` → `content` → `user` | No |
| `x_thread_post` | → `draft` → … → `user` | No |
| `publication` | → `composition` → `content` → `user` | Yes, query-performance exception |
| `ai_generation` | → `draft` → … → `user` | No |
| `research` | → `user` | Yes |
| `discovery_item` | global | N/A |
| `user_discovery_item` | → `user` | Yes |
| `notification` | → `user` | Yes |

## Authorization rule

Never authorize access merely because the caller knows a child row ID.

For child entities such as:

```text
draft
composition
angle
ai_generation
x_thread_post
```

authorization must verify the ownership chain resolves to the authenticated Better Auth user. The source schema states this explicitly. fileciteturn29file0L145-L152

---

# 18. Delete & Cascade Policy

The finalized relationship policy is summarized below. fileciteturn29file0L156-L188

```text
user
 ├─ application_profile        CASCADE
 ├─ social_connection          CASCADE
 ├─ media                      CASCADE
 ├─ content                    CASCADE
 ├─ research                   CASCADE
 ├─ notification               CASCADE
 ├─ notification_preference   CASCADE
 └─ publication                CASCADE

content
 ├─ content_context_media      CASCADE
 ├─ angle                      CASCADE
 └─ composition                CASCADE
        └─ draft               CASCADE
               ├─ ai_generation        CASCADE
               ├─ x_thread_post        CASCADE
               └─ draft_media          CASCADE
```

Protective relationships:

```text
composition ← publication.composition_id      RESTRICT
draft       ← publication.draft_id              SET NULL
social_connection ← publication.social_connection_id  SET NULL
x_thread_post ← ai_generation.target_x_thread_post_id SET NULL
media ← content_context_media.media_id          RESTRICT
media ← draft_media.media_id                     RESTRICT
research ← content.research_id                   SET NULL
research ← angle.research_id                     CASCADE
discovery_item ← content.discovery_item_id       SET NULL
```

The critical rule is:

> Existing Publication history prevents destructive Content-tree deletion through the `publication.composition_id` RESTRICT relationship.

The application should translate that FK failure into an understandable UI error rather than exposing a raw database exception.

---

# 19. Enums

The finalized schema defines the following enum families. fileciteturn29file0L196-L215

```text
platform
  linkedin | x

experience_level
  student | junior | mid_level | senior

writing_tone
  casual | balanced | formal

technical_depth
  beginner_friendly | detailed | expert

emoji_usage
  none | minimal | frequent

social_connection_status
  connected | disconnected | expired | revoked

media_kind
  image | document

content_origin
  manual | research | discovery

content_processing_status
  raw | analyzing | understood | failed

x_post_type
  standalone | reply | self_reply | thread | quote

x_target_kind
  external | own_publication

publication_status
  scheduled | publishing | published | publish_failed | cancelled | deleted | delete_failed

publication_failure_reason
  account_disconnected | platform_error | rate_limited | validation_error | unknown

ai_operation
  generate_draft | edit_draft | regenerate | restore

ai_generation_status
  pending | accepted | rejected | failed

research_status
  running | completed | failed

notification_type
  consistency_reminder

notification_email_status
  not_applicable | sent | failed
```

The writing-preference enum labels above remain [ASSUMPTION] in the supplied schema and should not be silently changed during implementation. fileciteturn29file0L198-L207

---

# 20. Unique Constraints & Indexes

The finalized schema defines the following key uniqueness/access patterns. fileciteturn29file0L221-L252

## Unique constraints

```text
technology                     lower(name)
interest                       lower(name)
user_technology                (user_id, technology_id)
user_interest                  (user_id, interest_id)
social_connection              UNIQUE(platform, platform_user_id)
                               ← global external-identity ownership
draft                          (composition_id, platform)
x_thread_post                  (draft_id, position)
x_external_post               (social_connection_id, platform_post_id)
draft_media                    unique per draft/media and draft/thread-post
                                 according to finalized partial unique indexes
discovery_item                 external_key
user_discovery_item            (user_id, discovery_item_id)
notification_preference       user_id
```

## Check constraints

```text
angle:
(content_id IS NOT NULL) != (research_id IS NOT NULL)
```

## High-value indexes

```text
content (user_id)
composition (content_id)
draft (composition_id)
ai_generation (draft_id, created_at)
publication (user_id, status)
publication (scheduled_for) WHERE status = 'scheduled'
publication (composition_id)
social_connection (user_id, platform)   ← non-unique lookup index; not a uniqueness rule
media (user_id)
research (user_id)
user_discovery_item (user_id, dismissed_at, saved_at)
notification (user_id, read_at)
discovery_item (category, archived_at)
```

Drizzle's supplied documentation supports indexing FK columns on the many side of one-to-many relationships and appropriate indexes on relationship tables for efficient joins. fileciteturn24file4L524-L536

---

# 21. Transaction Boundaries

The finalized transaction model is: fileciteturn29file0L257-L267

| Operation | Atomic unit |
|---|---|
| Accept AI proposal | Update Draft current text + AI generation status + current/pending AI pointers |
| Reject/Undo AI proposal | Update AI generation state + clear pending pointer; keep accepted Draft unchanged |
| Restore AI generation | Insert new accepted restore generation + update current Draft state/pointer |
| Schedule | Create Publication with snapshot; persist Trigger.dev task reference once accepted |
| Update scheduled snapshot | Replace the snapshot on the same Publication after explicit confirmation |
| External deletion | Update Publication deletion state/metadata |
| Social disconnect | Update Social Connection state; Publications respond according to publishing-time logic |

---

# 22. Scheduled Publication Snapshot Contract

Scheduling is governed by the finalized product behavior:

```text
Current Draft
      ↓
Preview / verification
      ↓
Schedule
      ↓
Immutable approved snapshot
      ↓
Trigger.dev
      ↓
Publish
```

If the Draft is subsequently edited:

```text
Scheduled version ≠ current Draft
```

the UI exposes:

```text
[Update scheduled post to this draft]
[Keep scheduled version]
```

The update is explicit and confirmed.

The scheduled Publication never silently reads mutable Draft state.

---

# 23. AI Proposal / Version Contract

AI Draft mutation follows:

```text
Current accepted Draft
        ↓
AI operation
        ↓
Persist proposal
        ↓
Review
   ┌────┴────┐
   ↓         ↓
Accept     Reject / Undo
```

While pending:

```text
manual editing = blocked
```

Once accepted:

```text
accepted AI version
        ↓
current Draft
        ↓
pending Undo disappears
```

AI generation history is user-visible and per Draft.

Manual edit history is not persisted.

---

# 24. What Deliberately Did Not Become a Table

The finalized schema intentionally does not add tables for:

```text
manual edit history
streak/metrics truth
separate discovery source
email delivery log
carousel/slides/PDF editor
```

Those exclusions are explicitly documented in the source finalized schema. fileciteturn29file0L271-L277

---

# 25. Drizzle / Better Auth Integration Rules

Better Auth-generated schema and app-owned schema are distinct responsibilities.

For Relations v2:

```text
appRelations
    ↓
authRelations (defineRelationsPart)
```

must be merged into the Drizzle configuration with generated auth relations spread after the application's main relations object. fileciteturn25file4L580-L603

Foreign keys enforce database-level referential integrity; Drizzle relation declarations are the application-level relational abstraction and do not themselves create FKs. fileciteturn24file1L191-L202

The implementation must therefore define both where appropriate:

```text
PostgreSQL FK
+
Drizzle relation
```

---

# 26. Implementation Rules for the Coding Agent

The final schema is a contract.

The agent must:

- implement the entity inventory without inventing additional V1 domain tables
- preserve Better Auth ownership boundaries
- preserve all ownership chains and authorization checks
- enforce database uniqueness/check constraints
- implement the defined cascade/RESTRICT/SET NULL behaviors
- preserve immutable scheduled snapshots
- preserve per-Draft AI generation history
- use transactions for the finalized atomic operations
- keep X-specific relationships explicit
- keep global Discovery Items separate from user personalization
- keep R2 object storage references out of database blobs
- keep carousel/PDF functionality out of V1

The agent must not:

- merge Content, Composition, Draft, and Publication
- turn Publication into a live pointer to mutable Draft content
- introduce a polymorphic `source_type/source_id` relationship
- add manual revision history
- delete individual AI generations
- silently change scheduled snapshots when Drafts change
- duplicate Better Auth user/session/account data
- create separate X/LinkedIn connection tables

---

# 27. Final Status

```text
Better Auth boundary           ✅ Finalized
Application Profile            ✅ Finalized
Social Connections              ✅ Finalized
Content                         ✅ Finalized
Angle                           ✅ Finalized
Composition / Draft             ✅ Finalized
X-specific model                ✅ Finalized
Media                           ✅ Finalized
Publication / Scheduling       ✅ Finalized
AI Generation / Versioning     ✅ Finalized
Research                        ✅ Finalized
Discovery / Personalization    ✅ Finalized
Consistency / Notifications    ✅ Finalized
Ownership                       ✅ Finalized
Delete / Cascade policy        ✅ Finalized
Indexes / constraints          ✅ Finalized
Transaction boundaries         ✅ Finalized

Physical Drizzle implementation 🚧 Next
```

---

# 28. Resolved source inconsistencies

These were open in the draft contract and are now locked:

### 1. Social connection uniqueness

**Canonical and final:** `UNIQUE(platform, platform_user_id)`

`(user_id, platform)` is a non-unique lookup index only.

### 2. Table count

**Canonical:** 23 SkillTrail-owned tables + 4 Better Auth tables (27 in the inventory).

### 3. Social connection status

**Canonical:** one enum, no health column: `connected | disconnected | expired | revoked`.

---

# 29. Next Step

This domain/schema contract is now the basis for the actual database implementation.

Next artifact:

```text
Drizzle schema
↓
migrations
↓
relations.ts
↓
DB integration tests
```

Any schema change discovered during implementation must first be reflected here (or explicitly recorded as an approved schema amendment) before silently changing the Drizzle model.
