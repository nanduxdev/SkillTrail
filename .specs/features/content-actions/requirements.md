# Requirements — content-actions

workflow: requirements-first
status: draft

## Scope

Implement the Server Action surface for the `Content` aggregate as specified in
`docs/actions-contract.md` §9 (Content CRUD), §10 (Context Media), and §11
(Content Understanding & Angles). Actions are built with `next-safe-action` v7
using `authActionClient`. Data-access functions (`getContentList`,
`getContent`) are plain async functions called directly from Server Components —
not actions.

This spec is distinct from `.specs/features/content-apis/` which covers the
REST Route Handler surface from `api-contract.md` §6–8. Both ultimately delegate
to the same `lib/domain/contentService` — the domain layer is shared.

---

## R1 — Create Content (`createContent`)

WHEN an authenticated user invokes `createContent` with optional `rawText`,
`origin`, `researchId`, `discoveryItemId`, and `contextMedia`
THEN the system SHALL insert a `content` row owned by the session `userId` and
return the full `Content` shape including any `contextMedia` attachments.

AND SHALL default `origin` to `"manual"` when the field is not provided.

AND SHALL default `processingStatus` to `"raw"` on creation.

AND SHALL return `serverError.code: NOT_FOUND` if `researchId` is provided but
does not exist or does not belong to the authenticated user.

AND SHALL return `serverError.code: NOT_FOUND` if `discoveryItemId` is provided
but does not refer to an existing, non-archived `discovery_item` row.
_(Note: `discovery_item` is a global table with no `userId` — there is no
ownership check. The only guard is existence and `archivedAt IS NULL`.)_

AND SHALL insert `content_context_media` rows atomically (same transaction as
the `content` insert) when `contextMedia` is provided.

AND SHALL return a `validationErrors` result if any `mediaId` within
`contextMedia` does not exist or does not belong to the authenticated user
(missing or foreign-owned media is a field-level validation error, not a domain
error).

Consistent with: no directly related numbered invariant; consistent with
`docs/domain.md` Content entity semantics (`origin`, `processingStatus`
defaults, media ownership model); `db/schema/content.ts` — `origin` default
`"manual"`, `processingStatus` default `"raw"`, `contentContextMedia`
composite PK `(contentId, mediaId)`.

Schema impact: none.

---

## R2 — Update Content (`updateContent`)

WHEN an authenticated user invokes `updateContent` with a bound `contentId` and
optional `rawText` and/or `origin`
THEN the system SHALL update only the supplied fields and return the updated
`Content` row.

AND SHALL NOT modify fields not present in the input.

AND SHALL return `serverError.code: NOT_FOUND` if the content does not exist or
does not belong to the authenticated user.

Consistent with: no directly related numbered invariant; `docs/domain.md`
Content entity (mutable raw material); `db/schema/enums.ts` —
`contentOriginEnum` restricts valid `origin` values to
`"manual" | "research" | "discovery"`.

Schema impact: none.

---

## R3 — Delete Content (`deleteContent`)

WHEN an authenticated user invokes `deleteContent` with a bound `contentId`
THEN the system SHALL delete the `content` row and return `{ deleted: true }`.

AND SHALL return `serverError.code: NOT_FOUND` if the content does not exist or
does not belong to the authenticated user.

AND SHALL return `serverError.code: CONFLICT` and NOT delete the content if any
live (non-cancelled, non-deleted) Publication exists anywhere in the content's
composition tree.

Consistent with: `docs/domain.md` — "Content deletion is blocked while a live
Publication exists in its composition tree"; `docs/architecture.md` —
enforced by RESTRICT FK from `publication.composition_id` to `composition.id`;
`db/schema/content.ts` — cascade deletes propagate to `content_context_media`,
`angle`, and `composition` on content deletion.

Schema impact: none.

---

## R4 — List & Read Content (data-access functions, not actions)

WHEN a Server Component needs to render the content list or a content detail
page, the system SHALL expose `getContentList(userId, { limit, cursor })` and
`getContent(userId, contentId)` as plain async functions (not Server Actions).

`getContentList` SHALL return `ContentSummary[]` with a `nextCursor` for
cursor-based pagination, scoped to the authenticated user only.

`getContent` SHALL return `{ content, angles, compositions }` for content owned
by the caller, or throw a domain NOT_FOUND error if the content does not exist
or does not belong to the caller.

Consistent with: `docs/architecture.md` — "Reads that only serve an initial page
load are not endpoints at all — they're plain data-access functions called
directly from Server Components"; `docs/actions-contract.md` §9;
`db/relations.ts` — `content.contextAttachments`, `content.angles`,
`content.compositions` relations.

Schema impact: none.

---

## R5 — Attach Context Media (`addContextMedia`)

WHEN an authenticated user invokes `addContextMedia` with a bound `contentId`
and input `{ mediaId, note? }`
THEN the system SHALL insert a `content_context_media` row and return
`{ contentId, mediaId, note }`.

AND SHALL return `serverError.code: NOT_FOUND` if the content does not exist or
does not belong to the authenticated user.

AND SHALL return `serverError.code: NOT_FOUND` if the media does not exist or
does not belong to the authenticated user.

AND SHALL return `serverError.code: CONFLICT` if the `(contentId, mediaId)` pair
already exists.

Consistent with: no directly related numbered invariant; `docs/domain.md` Media
entity — "context media provides AI context/input during content understanding";
`db/schema/content.ts` — `content_context_media` composite PK
`(contentId, mediaId)`, `media_id` has `ON DELETE RESTRICT`.

Schema impact: none.

---

## R6 — Remove Context Media (`removeContextMedia`)

WHEN an authenticated user invokes `removeContextMedia` with bound `contentId`
and `mediaId`
THEN the system SHALL delete the `content_context_media` row and return
`{ deleted: true }`.

AND SHALL return `serverError.code: NOT_FOUND` if the content does not exist or
does not belong to the authenticated user.

AND SHALL return `serverError.code: NOT_FOUND` if the `(contentId, mediaId)`
attachment row does not exist.

Consistent with: no directly related numbered invariant; `db/schema/content.ts`
— `content_context_media` composite PK `(contentId, mediaId)`.

Schema impact: none.

---

## R7 — Trigger Content Understanding (`analyzeContent`)

WHEN an authenticated user invokes `analyzeContent` with a bound `contentId`
and optional `{ force? }`
THEN the system SHALL set `processingStatus` to `"analyzing"` before invoking
the AI provider, then invoke `contentService.understand(userId, contentId, { force })`,
which calls `AiProvider.understandContent`, caches the result on
`content.understandingResult`, sets `processingStatus` to `"understood"`, and
returns `{ processingStatus: "understood", understandingResult: unknown }`.

AND SHALL return the cached `understandingResult` without calling the AI
provider if `understandingResult` is already populated and `force` is not `true`.

AND SHALL re-invoke the AI provider when `force: true` is provided, even if a
cached result exists.

AND SHALL NOT create `ai_generation` rows for this operation, and SHALL NOT
participate in the draft-level accept/reject/undo review flow.

AND SHALL return `serverError.code: NOT_FOUND` if the content does not exist or
does not belong to the authenticated user.

AND SHALL set `processingStatus` to `"failed"` and return
`serverError.code: PROVIDER_ERROR` if the AI provider call fails.

AND SHALL return `serverError.code: RATE_LIMITED` if the AI provider rate-limits
the request.

Consistent with: `docs/domain.md` — "Content-level AI operations (understanding,
angle generation) do not participate in the draft-level accept/reject/undo review
flow"; "`understandingResult` is regenerable cached data, not a reviewable AI
proposal"; `db/schema/content.ts` — `understandingResult jsonb`,
`processingStatus`; `docs/architecture.md` AI Architecture — all AI calls go
through the `AiProvider` abstraction (`AiProvider.understandContent`).

Schema impact: none.

---

## R8 — Generate Angles (`generateAngles`)

WHEN an authenticated user invokes `generateAngles` with a bound `contentId` and
optional `{ count? }`
THEN the domain service SHALL internally ensure `understandingResult` is
populated before generating angles — reusing the cached result when
`processingStatus = "understood"`, or running content understanding first
(equivalent to `analyzeContent` with `force: false`) when it is not.
The system SHALL then invoke the AI provider to generate angles and persist each
as an `angle` row with `contentId` set and `researchId` as `null`, returning
`{ angles: Angle[] }` with all newly generated rows.

AND SHALL NOT require the caller to have invoked `analyzeContent` first. There
is no `BAD_REQUEST` for unanalyzed content — understanding is an internal
implementation detail, not a user-visible gate.

AND SHALL NOT create `ai_generation` rows for this operation, and SHALL NOT
participate in the draft-level accept/reject flow.

AND SHALL ensure every generated `angle` row satisfies the
`angle_exactly_one_parent` CHECK constraint (exactly one of `contentId` or
`researchId` is non-null).

AND SHALL use `count` to control how many angles the AI generates; if omitted,
the provider's default count applies.

AND SHALL return `serverError.code: NOT_FOUND` if the content does not exist or
does not belong to the authenticated user.

AND SHALL return `serverError.code: PROVIDER_ERROR` if the AI provider call
fails (either during the implicit understanding step or the angle generation
step).

AND SHALL return `serverError.code: RATE_LIMITED` if the AI provider
rate-limits the request at either step.

Consistent with: `docs/domain.md` — "Angles are AI-generated; there is no
concept of a manually authored angle"; "An Angle belongs to exactly one parent:
either a Content item or a Research session (enforced by a CHECK constraint)";
"Content-level AI operations… do not participate in the draft-level
accept/reject/undo review flow"; `db/schema/content.ts` —
`angle_exactly_one_parent` CHECK constraint.

Schema impact: none.

---

## Out of Scope (this feature)

- Research-owned angle generation (separate: research-actions)
- Draft Server Actions (separate: draft-actions)
- Media upload / presigned URL intent (separate: media-actions)
- Composition Server Actions (separate: composition-actions)
- Pagination filtering beyond `limit`/`cursor`
- Streaming AI output (explicitly out of scope per `actions-contract.md` §0)
