# SkillTrail — API Contract v1.0

**Status:** LOCKED for V1
**Consumers:** `apps/web` frontend only. `apps/worker` and the future `apps/mcp-server` call `packages/core` directly and are **not** bound by this contract.
**Backing schema:** `SkillTrail-Schema-Spec-v1.0.md` + `db/schema/*.ts` (as updated: single `social_connection_status` enum, global `UNIQUE(platform, platform_user_id)`).
**Transport:** Next.js Route Handlers (App Router), same-origin, session-cookie auth via Better Auth. JSON in, JSON out, except where noted (file upload, OAuth redirects).

Every endpoint below maps to a specific schema decision. Where this contract had to make a call that isn't dictated by the schema, it's flagged **[ASSUMPTION]**, matching the convention in the schema spec — confirm or adjust before frontend work locks onto it.

---

## 0. Conventions

### 0.1 Base path

All SkillTrail-owned routes live under `/api/*`. Better Auth owns `/api/auth/*` entirely (see §1) — never add a SkillTrail route under that prefix.

### 0.2 Auth

Every route below requires an authenticated session (Better Auth session cookie) unless explicitly marked **Public**. Unauthenticated requests get:

```json
{ "error": { "code": "UNAUTHENTICATED", "message": "Sign in required." } }
```

`401`.

### 0.3 Ownership enforcement

Every resource-by-id route re-derives ownership by walking the FK chain up to the session's `user_id` (per Schema Spec §3 — "never fetch by ID alone"). A resource that exists but isn't owned by the caller returns `404`, not `403` — don't leak existence.

### 0.4 Response envelope

Success:

```json
{ "data": { ... } }
```

List success:

```json
{ "data": [ ... ], "pageInfo": { "nextCursor": "string | null", "hasMore": true } }
```

Error:

```json
{
  "error": { "code": "STRING_CODE", "message": "human-readable", "details": {} }
}
```

**[ASSUMPTION]** Cursor-based pagination (`?cursor=&limit=`) for every list endpoint, not offset/page — nothing upstream specifies this; cursor pagination was chosen because publications/notifications/discovery feed/media library are all append-heavy, sorted-by-time lists where offset pagination drifts under concurrent inserts. Default `limit=20`, max `100`.

### 0.5 Standard error codes

```text
UNAUTHENTICATED        401
NOT_FOUND              404
VALIDATION_ERROR       400   -- details.fields: { field: message }
CONFLICT               409   -- e.g. delete blocked by RESTRICT, pending AI proposal blocks manual edit
PRECONDITION_FAILED    412   -- e.g. acting on a publication that already left 'scheduled' status
RATE_LIMITED           429
INTERNAL               500
```

### 0.6 IDs and dates

All SkillTrail-owned resource IDs are UUID strings. `user_id` (Better Auth) is an opaque string, not necessarily a UUID — never assume UUID shape for it. All timestamps are ISO-8601 UTC strings.

### 0.7 Idempotency

Mutating endpoints that trigger external side effects (publish, external delete, OAuth connect) accept an optional `Idempotency-Key` header. **[ASSUMPTION]** — not specified upstream, included because "publish now" and "delete from platform" are exactly the kind of action a flaky network makes users double-click.

---

## 1. Auth — Better Auth (reference only, not designed here)

Mounted at `/api/auth/*` by the Better Auth handler. Documented here only so frontend knows not to reimplement these.

| Method | Path                                        | Purpose                              |
| ------ | ------------------------------------------- | ------------------------------------ |
| POST   | `/api/auth/sign-up/email`                   | Email/password sign-up               |
| POST   | `/api/auth/sign-in/email`                   | Email/password sign-in               |
| GET    | `/api/auth/sign-in/social?provider=google`  | Google OAuth sign-in (redirect flow) |
| POST   | `/api/auth/sign-out`                        | Sign out, clears session             |
| GET    | `/api/auth/get-session`                     | Current session + user               |
| GET    | `/api/auth/is-username-available?username=` | Username plugin availability check   |

Frontend uses Better Auth's official client SDK for these, not raw `fetch` — do not hand-roll request/response shapes for this section.

---

## 2. Profile & Personalization

Backs `application_profile`, `technology`/`user_technology`, `interest`/`user_interest` (Schema Spec §2.2).

| Method | Path                                      | Description                                                                                                                                                                    |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/profile`                            | Current user's merged profile: Better Auth `name`/`username`/`email`/`image` + `application_profile` fields + selected technologies/interests                                  |
| PATCH  | `/api/profile`                            | Update `experienceLevel`, `preferredPlatforms`, `writingTone`, `technicalDepth`, `emojiUsage`, `writingInstruction` — partial update, any subset of fields                     |
| GET    | `/api/technologies?search=`               | Suggestion list from the global catalog, `search` filters by prefix, case-insensitive                                                                                          |
| POST   | `/api/technologies`                       | Create-or-reuse a custom technology. Body: `{ "name": "Bun" }`. Returns the existing row (200) if the lowercased name already exists, else creates (201) with `isCustom: true` |
| POST   | `/api/profile/technologies`               | Attach an existing technology to the current user. Body: `{ "technologyId": "uuid" }`                                                                                          |
| DELETE | `/api/profile/technologies/:technologyId` | Detach                                                                                                                                                                         |
| GET    | `/api/interests?search=`                  | Same shape as technologies                                                                                                                                                     |
| POST   | `/api/interests`                          | Same shape as technologies                                                                                                                                                     |
| POST   | `/api/profile/interests`                  | Same shape as `profile/technologies`                                                                                                                                           |
| DELETE | `/api/profile/interests/:interestId`      | Detach                                                                                                                                                                         |

**`GET /api/profile` response:**

```json
{
  "data": {
    "userId": "string",
    "name": "string",
    "username": "string",
    "email": "string",
    "image": "string | null",
    "experienceLevel": "student | junior | mid_level | senior | null",
    "preferredPlatforms": ["linkedin", "x"],
    "writingTone": "casual | balanced | formal | null",
    "technicalDepth": "beginner_friendly | detailed | expert | null",
    "emojiUsage": "none | minimal | frequent | null",
    "writingInstruction": "string | null",
    "technologies": [{ "id": "uuid", "name": "TypeScript" }],
    "interests": [{ "id": "uuid", "name": "Open Source" }]
  }
}
```

---

## 3. Social Connections

Backs `social_connection` (Schema Spec §2.3, as updated). Tokens are **never** included in any response body from this section — the API surface exposes connection metadata only.

| Method | Path                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/social-connections`                           | List current user's connections, all platforms, all statuses                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| GET    | `/api/social-connections/:platform/connect-url`     | Get the OAuth authorize URL for `platform` (`linkedin`\|`x`). Frontend does a full-page redirect to this URL — not fetched as data to render                                                                                                                                                                                                                                                                                                                                                    |
| GET    | `/api/social-connections/:platform/callback`        | OAuth callback target (server-side only; not called via `fetch`). On success: upserts the row keyed on the global `(platform, platform_user_id)` identity — if that identity already belongs to a **different** SkillTrail user, the connect attempt fails with `CONFLICT` and the frontend must show "this account is already connected to another SkillTrail user," per the global-identity rule in Schema Spec §2.3. Redirects back to the app with a query param indicating success/failure |
| GET    | `/api/social-connections/:id/affected-publications` | Preview what would be affected by disconnecting — returns scheduled publications currently tied to this connection, so the frontend can show a confirmation dialog before disconnect (per the domain doc: "user must explicitly confirm" when schedules are present)                                                                                                                                                                                                                            |
| PATCH  | `/api/social-connections/:id`                       | Body: `{ "action": "disconnect", "confirm": true }` — sets `status = disconnected`, `disconnectedAt = now()`. `confirm: true` is **required** if `affected-publications` is non-empty; omitting it when affected publications exist returns `412 PRECONDITION_FAILED`                                                                                                                                                                                                                           |
| DELETE | `/api/social-connections/:id`                       | Fully forgets the connection (not just disconnect). `publication.social_connection_id` on any historical rows is set `NULL` server-side (`ON DELETE SET NULL`); publication history itself is untouched                                                                                                                                                                                                                                                                                         |

**Note on reconnect:** there is no separate "reconnect" endpoint. Re-running `GET /api/social-connections/:platform/connect-url` → OAuth flow → callback naturally upserts the same `(platform, platform_user_id)` row back to `status = 'connected'` with fresh tokens, per the domain doc's "reconnect returns the row to connected."

**Note on account selection:** there is no "set default account" endpoint — the schema deliberately has no default-account column. Any endpoint that needs a social connection (scheduling, publishing, the X external-post picker) requires an explicit `socialConnectionId` in its request body whenever the user has more than one connection for that platform; see §9 and §11. The frontend is responsible for the 0/1/2+ selection UX described in the domain doc (auto-use the single connection, prompt when 2+, prompt to connect when 0).

**List item shape:**

```json
{
  "id": "uuid",
  "platform": "linkedin | x",
  "platformUsername": "string | null",
  "displayName": "string | null",
  "avatarUrl": "string | null",
  "status": "connected | disconnected | expired | revoked",
  "connectedAt": "timestamp",
  "disconnectedAt": "timestamp | null"
}
```

---

## 4. Media

Backs `media`, `content_context_media`, `draft_media` (Schema Spec §2.8).

| Method | Path                       | Description                                                                                                                                                                                                                |
| ------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/media/upload-url`    | Body: `{ "filename", "mimeType", "sizeBytes", "kind": "image \| document" }`. Returns a presigned R2 PUT URL + a `mediaId` for a row already created in an unconfirmed state                                               |
| POST   | `/api/media/:id/complete`  | Called after the client-side PUT to R2 succeeds. Server verifies the object exists, extracts `width`/`height` for images, marks the row usable                                                                             |
| GET    | `/api/media?kind=&cursor=` | List the current user's library, newest first                                                                                                                                                                              |
| GET    | `/api/media/:id`           | Detail (includes a short-lived signed read URL)                                                                                                                                                                            |
| DELETE | `/api/media/:id`           | Delete. `409 CONFLICT` if still referenced by any `content_context_media` or `draft_media` row (RESTRICT) — response `details` includes which content/draft IDs are blocking it, so the frontend can offer to detach first |

**[ASSUMPTION]** — the two-step upload flow (`upload-url` → client PUT → `complete`) isn't specified upstream; it's the standard pattern for keeping large binaries off the Next.js route handler and out of request bodies entirely.

---

## 5. Content

Backs `content`, `content_context_media`, `angle` (Schema Spec §2.4, §2.5).

| Method | Path                                             | Description                                                                                                                                                                                                                                                                                                    |
| ------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/content`                                   | Create manual content. Body: `{ "rawText": "string", "contextMediaIds": ["uuid"]? }`. `origin` is always `manual` on this route — `research`/`discovery` origin content is only created via §6/§7's convert endpoints                                                                                          |
| GET    | `/api/content?origin=&processingStatus=&cursor=` | List current user's content                                                                                                                                                                                                                                                                                    |
| GET    | `/api/content/:id`                               | Detail: raw text, origin, processing status, `understandingResult`, context media, angle summaries, composition summaries                                                                                                                                                                                      |
| PATCH  | `/api/content/:id`                               | Update `rawText`. If `processingStatus` is `understood`, this resets it to `raw` server-side — editing the source material invalidates the cached understanding                                                                                                                                                |
| DELETE | `/api/content/:id`                               | `409 CONFLICT` if any composition beneath it has a live publication (RESTRICT chain, Schema Spec §4)                                                                                                                                                                                                           |
| POST   | `/api/content/:id/context-media`                 | Attach. Body: `{ "mediaId": "uuid", "note": "string"? }`                                                                                                                                                                                                                                                       |
| DELETE | `/api/content/:id/context-media/:mediaId`        | Detach                                                                                                                                                                                                                                                                                                         |
| POST   | `/api/content/:id/understand`                    | Trigger AI content-understanding (`AiProvider.understandContent`). Sets `processingStatus = analyzing` immediately, returns `202`; result lands in `understandingResult` and `processingStatus = understood` (or `failed`) asynchronously — frontend polls `GET /api/content/:id` or subscribes (see §13 note) |
| POST   | `/api/content/:id/angles`                        | Trigger AI angle generation (`AiProvider.generateAngles`). Requires `processingStatus = understood`; `412` otherwise. Creates `angle` rows                                                                                                                                                                     |
| GET    | `/api/content/:id/angles`                        | List angles generated for this content                                                                                                                                                                                                                                                                         |

---

## 6. Research

Backs `research`, `research_source` (Schema Spec §2.11).

| Method | Path                                   | Description                                                                                                                                                                                                              |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/research`                        | Body: `{ "query": "string" }`. Creates the row (`status = running`), kicks off the Trigger.dev task, returns `202` with the `research.id` immediately                                                                    |
| GET    | `/api/research?status=&cursor=`        | List current user's research sessions                                                                                                                                                                                    |
| GET    | `/api/research/:id`                    | Detail: `synthesis`, `status`, `sources[]`, `angles[]` (via the shared `angle` table, Schema Spec §2.5)                                                                                                                  |
| DELETE | `/api/research/:id`                    | Any `content.research_id` referencing it is set `NULL` (SET NULL, not RESTRICT — research is supplementary, per Schema Spec §4)                                                                                          |
| POST   | `/api/research/:id/convert-to-content` | Creates a `content` row with `origin = research`, `researchId = this research`, `rawText` seeded from `synthesis` (editable before saving — body may override: `{ "rawText": "string"? }`). Returns the new `content.id` |

---

## 7. Discovery

Backs `discovery_item`, `user_discovery_item` (Schema Spec §2.12). `discovery_item` itself is global/unowned — nothing here lets the frontend create or edit discovery items, only interact with the feed.

| Method | Path                                    | Description                                                                                                                                                                                                                            |
| ------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/discovery?category=&cursor=`      | Personalized feed for the current user — ranked by `user_discovery_item.relevanceScore`, excludes `dismissedAt IS NOT NULL` and `archivedAt IS NOT NULL` by default                                                                    |
| GET    | `/api/discovery/:id`                    | Item detail: `title`, `summary`, `whyItMatters`, `category`, `sourceUrl`, `sourceName`, `suggestedAngles[]` (plain strings, not the `angle` table — Schema Spec §2.12)                                                                 |
| POST   | `/api/discovery/:id/seen`               | Sets `seenAt` on the `user_discovery_item` row (upserts it if this is the first interaction)                                                                                                                                           |
| POST   | `/api/discovery/:id/save`               | Sets `savedAt`                                                                                                                                                                                                                         |
| POST   | `/api/discovery/:id/dismiss`            | Sets `dismissedAt` — removes it from the default feed query                                                                                                                                                                            |
| POST   | `/api/discovery/:id/convert-to-content` | Creates a `content` row with `origin = discovery`, `discoveryItemId = this item`. Body: `{ "rawText": "string" }` — unlike research, there's no synthesis text to auto-seed from; the user writes their own take on the discovery item |

---

## 8. Composition

Backs `composition` (Schema Spec §2.6).

| Method | Path                            | Description                                                                                 |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| POST   | `/api/content/:id/compositions` | Body: `{ "angleId": "uuid"? }` — omit for "no angle"                                        |
| GET    | `/api/compositions/:id`         | Detail: `angle`, `drafts[]` (one per platform that exists so far), `publications[]` summary |
| DELETE | `/api/compositions/:id`         | `409 CONFLICT` if a live publication exists (RESTRICT)                                      |

There is no "change angle" PATCH — per Schema Spec §2.6, changing the angle means creating a **new** composition, not mutating this one. The frontend flow is: `POST /api/content/:id/compositions` again with a different `angleId`.

---

## 9. Draft

Backs `draft`, `x_thread_post`, `x_external_post`, `draft_media` (Schema Spec §2.6–§2.8).

| Method | Path                           | Description                                                                                                                                                                                                                                                                                    |
| ------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/compositions/:id/drafts` | Body: `{ "platform": "linkedin \| x" }`. `409 CONFLICT` if a draft for this `(composition, platform)` already exists (unique constraint) — frontend should `GET` instead                                                                                                                       |
| GET    | `/api/drafts/:id`              | Full detail: `bodyText`, `xPostType`, `targetKind` + resolved target (external post or publication summary), `threadPosts[]` (if thread), `mediaAttachments[]`, `pendingAiGeneration` / `currentAiGeneration` summaries, `aiAssisted`                                                          |
| PATCH  | `/api/drafts/:id`              | Manual edit. Body: any of `{ "bodyText", "xPostType", "targetKind", "targetExternalPostId", "targetPublicationId" }`. `409 CONFLICT` if `pendingAiGenerationId` is set — an unresolved AI proposal blocks manual edits (Schema Spec §2.10); the frontend must accept/reject it first (see §10) |
| DELETE | `/api/drafts/:id`              | Cascades to thread posts, draft media rows, AI generation history                                                                                                                                                                                                                              |

### 9.1 X thread posts

Only valid when the draft's `xPostType = 'thread'`.

| Method | Path                                   | Description                                                                                                               |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/drafts/:id/thread-posts`         | Body: `{ "bodyText": "string", "position": number }`                                                                      |
| PATCH  | `/api/drafts/:id/thread-posts/:postId` | Body: `{ "bodyText" }`                                                                                                    |
| DELETE | `/api/drafts/:id/thread-posts/:postId` | Any `ai_generation` rows scoped to it keep their history (`target_x_thread_post_id` → `NULL`, per Schema Spec §4)         |
| PUT    | `/api/drafts/:id/thread-posts/reorder` | Body: `{ "orderedPostIds": ["uuid", ...] }` — server reassigns `position` 0..N in the given order, inside one transaction |

### 9.2 Draft media

| Method | Path                                  | Description                                                                                                                                                                                   |
| ------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/drafts/:id/media`               | Body: `{ "mediaId": "uuid", "xThreadPostId": "uuid"?, "position": number }`. `409` if this exact `(mediaId, xThreadPostId)` pair is already attached (partial unique index, Schema Spec §2.8) |
| PATCH  | `/api/drafts/:id/media/:draftMediaId` | Body: `{ "position": number }` — reorder                                                                                                                                                      |
| DELETE | `/api/drafts/:id/media/:draftMediaId` | Detach (does not delete the underlying `media` row)                                                                                                                                           |

### 9.3 X external-post picker

Used to populate `targetExternalPostId` for `reply`/`self_reply`/`quote` drafts.

| Method | Path                                                      | Description                                                                                                                                           |
| ------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/x/external-posts/search?socialConnectionId=&query=` | Searches X on behalf of the given connection (must belong to the current user, `platform = 'x'`), caches results into `x_external_post`, returns them |
| GET    | `/api/x/external-posts/:id`                               | Fetch a single cached external post by its SkillTrail-local `id` (used to redisplay a previously-picked target without re-searching)                  |

---

## 10. AI Generation

Backs `ai_generation` and the two pointer columns on `draft` (Schema Spec §2.10). This is the section with the most non-obvious request/response shapes — read it before wiring the compose UI.

| Method | Path                              | Description                                                                                                                                                                                                                                                                                                                                                          |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/drafts/:id/ai/generate`     | First-ever generation for this draft. Body: `{ "instruction": "string"? }`. `409` if `bodyText` (or any thread post) already has content — use `regenerate` instead                                                                                                                                                                                                  |
| POST   | `/api/drafts/:id/ai/edit`         | Body: `{ "instruction": "string", "targetXThreadPostId": "uuid"? }`. Natural-language edit against the _current_ text                                                                                                                                                                                                                                                |
| POST   | `/api/drafts/:id/ai/regenerate`   | Body: `{ "targetXThreadPostId": "uuid"? }` — omit for whole-draft/whole-thread regeneration, include to regenerate a single thread item                                                                                                                                                                                                                              |
| GET    | `/api/drafts/:id/ai-generations`  | Full history, newest first                                                                                                                                                                                                                                                                                                                                           |
| POST   | `/api/ai-generations/:id/accept`  | Applies `afterText` to `draft.bodyText` (or the target thread post), sets `status = accepted`, updates `draft.currentAiGenerationId`, clears `draft.pendingAiGenerationId`                                                                                                                                                                                           |
| POST   | `/api/ai-generations/:id/reject`  | Sets `status = rejected`, clears `draft.pendingAiGenerationId`. Draft body is untouched (it was never written to)                                                                                                                                                                                                                                                    |
| POST   | `/api/ai-generations/:id/restore` | Only valid on an already-`accepted` historical row. Creates a **new** `ai_generation` row (`operation = restore`, `status = accepted` immediately — no pending state, since restoring is itself the confirmation) and re-applies its `afterText` to the draft. Per Schema Spec §2.10, nothing is deleted or rewritten — restoring earlier history is always additive |

All three generate/edit/regenerate endpoints are asynchronous: they create the `ai_generation` row with `status = pending` and return it (`202`) immediately; the LLM call resolves out-of-band and flips it to `pending → (still pending, now with `afterText` populated and ready for review)` — clarified below.

**Generation lifecycle detail** (this is the one place the naive reading of `status: pending` is ambiguous — spelling it out):

```text
Row created, LLM call in flight  → status = "pending", afterText = null
LLM call succeeds                → status = "pending", afterText = "..."   (now awaiting user accept/reject)
LLM call errors                  → status = "failed",  errorMessage set
User accepts                     → status = "accepted"
User rejects                     → status = "rejected"
```

The frontend distinguishes "still generating" from "ready to review" by checking `afterText === null` while `status === "pending"`, not by status alone. **[ASSUMPTION]** — the schema (Schema Spec §2.10) defines the `pending | accepted | rejected | failed` enum but doesn't split "generating" from "awaiting review" into separate states; adding a fifth enum value was avoided to keep the accept/reject state machine exactly as locked, so this contract handles the distinction via `afterText` nullability instead. Flag if you'd rather this be a real enum value (`generating`) — it's a clean, additive schema change if so.

**Response shape (all four generation-producing endpoints + the history list):**

```json
{
  "id": "uuid",
  "draftId": "uuid",
  "targetXThreadPostId": "uuid | null",
  "operation": "generate_draft | edit_draft | regenerate | restore",
  "status": "pending | accepted | rejected | failed",
  "instruction": "string | null",
  "beforeText": "string | null",
  "afterText": "string | null",
  "createdAt": "timestamp",
  "resolvedAt": "timestamp | null"
}
```

Token/latency/provider/model fields exist on the table for observability but are **not** included in this response — internal-only, no product reason to ship them to the client. **[ASSUMPTION]** — add an `?include=debug` query param later if you want them surfaced for your own QA.

---

## 11. Publication / Scheduling

Backs `publication` (Schema Spec §2.9). This is where a social connection must finally be chosen (§3's "no default account" note).

| Method | Path                                                    | Description                                                                                                                                |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/compositions/:id/publications`                    | Schedule or publish immediately. Body below                                                                                                |
| GET    | `/api/publications?status=&platform=&from=&to=&cursor=` | List/history — dashboard's primary query                                                                                                   |
| GET    | `/api/publications/:id`                                 | Detail, including the frozen `snapshot`                                                                                                    |
| PATCH  | `/api/publications/:id`                                 | Update `scheduledFor` and/or `snapshot` — only while `status = scheduled`. `412 PRECONDITION_FAILED` otherwise (e.g. already `publishing`) |
| POST   | `/api/publications/:id/cancel`                          | Only while `status = scheduled`. Sets `status = cancelled`, `cancelledAt` — row is retained forever (Schema Spec §2.9)                     |
| POST   | `/api/publications/:id/retry`                           | Only while `status = publish_failed`. Re-enqueues the Trigger.dev publish task against the existing `snapshot`                             |
| DELETE | `/api/publications/:id/external`                        | Only while `status = published`. Triggers deletion of the actual post on LinkedIn/X. Resolves to `status = deleted` or `delete_failed`     |

**`POST /api/compositions/:id/publications` request:**

```json
{
  "platform": "linkedin | x",
  "socialConnectionId": "uuid",
  "scheduledFor": "timestamp | null"
}
```

- `socialConnectionId` is **required** — per §3, the schema has no default-account concept, so the caller always states which connection to publish through. `400 VALIDATION_ERROR` if omitted.
- `scheduledFor: null` means publish immediately (`status` starts as `publishing`, not `scheduled`).
- The server builds `snapshot` at request time from the current `draft` state (text, thread structure, media + order, targets) — this is the one moment the mutable draft becomes an immutable record, per Schema Spec §2.9. There's no separate "build snapshot" step the frontend calls first.
- `409 CONFLICT` if the given `socialConnectionId`'s `status !== 'connected'`.

**List item shape:**

```json
{
  "id": "uuid",
  "compositionId": "uuid",
  "platform": "linkedin | x",
  "status": "scheduled | publishing | published | publish_failed | cancelled | deleted | delete_failed",
  "scheduledFor": "timestamp | null",
  "publishedAt": "timestamp | null",
  "externalPostUrl": "string | null",
  "failureReason": "account_disconnected | platform_error | rate_limited | validation_error | unknown | null",
  "lastError": "string | null"
}
```

---

## 12. Notifications

Backs `notification`, `notification_preference` (Schema Spec §2.13).

| Method | Path                                     | Description                                                                                 |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| GET    | `/api/notifications?unreadOnly=&cursor=` | List, newest first                                                                          |
| POST   | `/api/notifications/:id/read`            | Sets `readAt`                                                                               |
| POST   | `/api/notifications/read-all`            | Bulk mark-read                                                                              |
| GET    | `/api/notification-preferences`          | Current settings                                                                            |
| PATCH  | `/api/notification-preferences`          | Body: any of `{ "consistencyRemindersEnabled", "inactivityThresholdDays", "emailEnabled" }` |

---

## 13. Dashboard (derived, read-only)

**[ASSUMPTION]** — this whole section is a convenience aggregate for the frontend home screen; none of it is a stored table (Schema Spec §8 explicitly rules out a separate streak/metrics table — `publication` stays the only source of truth). Everything here is computed on read from `publication` + `notification`.

| Method | Path                     | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| GET    | `/api/dashboard/summary` | One aggregate payload for the home screen |

**Response:**

```json
{
  "data": {
    "upcomingScheduled": [
      /* next N publication list items, status=scheduled, ordered by scheduledFor */
    ],
    "recentlyPublished": [
      /* last N publication list items, status=published */
    ],
    "lastPublishedAt": "timestamp | null",
    "unreadNotificationCount": 0
  }
}
```

No streak number is computed server-side in this contract — "days since `lastPublishedAt`" is cheap enough to derive client-side from the one timestamp, avoiding yet another place that could disagree with `publication` about the truth.

### 13.1 Real-time updates

Long-running operations in this contract (`content.understand`, `research` creation, all of §10's AI generation endpoints, publish execution) resolve asynchronously server-side. **[ASSUMPTION]** — this contract specifies polling (`GET` the resource again) as the baseline mechanism, since nothing upstream locks in a transport for this. If the compose UI feels laggy on polling alone, the next step would be Server-Sent Events on a `GET /api/drafts/:id/events` style endpoint — not designed here, flagged as a likely V1.1 addition rather than guessed at now.

---

## Appendix: Endpoint count by domain

```text
Profile & Personalization    10
Social Connections            6
Media                         5
Content                       9
Research                      5
Discovery                     6
Composition                   3
Draft (+ thread + media + picker)  13
AI Generation                  7
Publication                    7
Notifications                  5
Dashboard                      1
─────────────────────────────────
Total (excl. Better Auth)     77
```
