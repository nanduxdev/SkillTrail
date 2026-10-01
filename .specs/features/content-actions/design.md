# Design — content-actions

## Approach

RECOMMENDATION: Follow the file/folder conventions from `docs/actions-contract.md` §6
exactly. Three new files are introduced:

1. `lib/domain/content-service.ts` — all domain logic for the Content aggregate
2. `features/content/actions.ts` — thin `next-safe-action` wrappers (8 actions)
3. `features/content/queries.ts` — plain async data-access functions for Server
   Component reads (`getContentList`, `getContent`)

A fourth file adds the Zod input schemas shared between actions and the domain:

4. `lib/schemas/content.ts` — Content-specific Zod schemas

No new infrastructure, libraries, or background jobs. All operations in this
feature are synchronous within the request/response lifecycle per
`docs/architecture.md` — "interactive AI operations stay synchronous."

---

## Files Touched / Created

Verified against current repo state:

| File | Status | Notes |
|---|---|---|
| `lib/schemas/content.ts` | **Create** | Zod input schemas for all content actions |
| `lib/domain/content-service.ts` | **Create** | All domain logic; called by actions and (later) Trigger.dev tasks |
| `features/content/actions.ts` | **Create** | `"use server"` — 6 mutation actions + 2 read actions |
| `features/content/queries.ts` | **Create** | Plain async functions for Server Components |
| `lib/schemas/enums.ts` | **Extend** | Add `contentOriginSchema` (missing from current file) |

Files confirmed to exist already (no creation needed):
- `lib/safe-action.ts` — `authActionClient` ✓
- `lib/errors.ts` — `notFound`, `conflict`, `providerError`, `rateLimited`, `validationError` ✓
- `db/schema/content.ts` — `content`, `contentContextMedia`, `angle` ✓
- `db/schema/enums.ts` — `contentOriginEnum`, `contentProcessingStatusEnum` ✓
- `db/schema/discovery.ts` — `discoveryItem` (global, unowned) ✓
- `db/schema/publication.ts` — `publication`, RESTRICT FK confirmed ✓

No `features/` directory exists yet in the repo (confirmed: `app/` has no
`features/` counterpart, and the contract places `features/` at the repo root
peer to `lib/`). This feature creates it.

---

## Domain Layer Placement

FACT: `docs/architecture.md` Domain Layer Rule — "Domain/business logic stays
outside UI components, Server Actions, and Route Handlers."

FACT: `docs/actions-contract.md` §6 — "Domain services are the only layer that
touches Drizzle. Actions and the 3 remaining routes both call into `domain/*`,
never the ORM directly."

RECOMMENDATION: All Drizzle queries, ownership checks, business rules, and AI
provider calls live in `lib/domain/content-service.ts`. The actions in
`features/content/actions.ts` are pure adapters: parse → call domain → return.

The `contentService` is the shared contract between the Next.js application
(Server Actions) and future Trigger.dev tasks (e.g., if background angle
generation is ever added). Trigger.dev tasks import from `lib/domain/` directly,
never calling Server Actions or HTTP routes.

---

## Key Design Decisions per Requirement

### R1 — `createContent`

FACT: `contentContextMedia` composite PK `(contentId, mediaId)` — atomic insert
required.

RECOMMENDATION: `contentService.create()` runs inside a Drizzle transaction:
1. Insert `content` row.
2. Validate all `mediaId` values (existence + `media.userId = callerId`). Collect
   unknowns/foreign into a `validationErrors` object; if any, roll back and
   surface via `returnValidationErrors()` in the action.
3. Deduplicate `mediaId` values via `Set` before inserting.
4. Insert `content_context_media` rows atomically.

FACT: `discoveryItem` has no `userId` — ownership check is existence +
`archivedAt IS NULL` only. (INFERENCE: `archivedAt IS NULL` is the correct
"active item" check, per schema comment "soft-archive out of the active feed".)

RECOMMENDATION: `researchId` ownership check: join `content` ← `research` where
`research.userId = callerId`. `discoveryItemId` check: existence +
`archivedAt IS NULL` only (no userId join possible).

### R2 — `updateContent`

RECOMMENDATION: `contentService.update()` builds a partial update object from
only the supplied fields (same pattern as `lib/domain/profile.ts` lines 157–171).
Ownership: fetch the content row first, compare `content.userId` to `callerId`,
throw `notFound()` on mismatch (never `forbidden()`). Drizzle's `.$onUpdate()`
handles `updatedAt` automatically.

### R3 — `deleteContent`

FACT: `publication.compositionId` has `ON DELETE RESTRICT` from
`db/schema/publication.ts` — this is the enforcement point.

RECOMMENDATION: `contentService.delete()` pre-queries for live publications
before attempting DELETE:

```ts
const livePublications = await db
  .select({ id: publication.id })
  .from(publication)
  .innerJoin(composition, eq(composition.id, publication.compositionId))
  .where(
    and(
      eq(composition.contentId, contentId),
      notInArray(publication.status, ["cancelled", "deleted"])
    )
  )
  .limit(1);

if (livePublications.length > 0) throw conflict("...");
```

The RESTRICT FK remains as a database-level safety net. The pre-query produces
the clean `CONFLICT` error without needing to catch Postgres error code `23503`.

### R4 — `getContentList` / `getContent` (queries, not actions)

RECOMMENDATION: These live in `features/content/queries.ts` as plain `async`
functions. Server Components import them directly. On `NOT_FOUND`, they throw
`AppError("NOT_FOUND")`; the calling Server Component catches it and calls
Next.js `notFound()` to render the nearest `not-found.tsx` boundary.

Return shapes:
- `getContentList` → `{ items: ContentSummary[], nextCursor: string | null }`
- `getContent` → `{ content: Content, angles: Angle[], compositions: CompositionSummary[] }`

INFERENCE: `ContentSummary` does not need `understandingResult` (large JSONB) —
exclude it from the list query for performance.

### R5 / R6 — `addContextMedia` / `removeContextMedia`

RECOMMENDATION: Both live in `lib/domain/content-service.ts` alongside the
create logic. `addContextMedia` uses `.insert().onConflictDoNothing()` to detect
duplicates cleanly — if `insertedRowCount === 0` after dedup by the PK, throw
`conflict()`. Or use explicit existence pre-query (simpler, more readable, and
consistent with the rest of the domain service). Prefer explicit pre-query.

`removeContextMedia` ownership: verify `content.userId = callerId` first (via
content row fetch), then delete the `content_context_media` row; `NOT_FOUND` if
the attachment row didn't exist (check `rowsAffected`).

### R7 — `analyzeContent`

FACT: `content.processingStatus` enum has `"raw"`, `"analyzing"`, `"understood"`,
`"failed"` (confirmed in `db/schema/enums.ts`).

RECOMMENDATION: `contentService.understand()`:
1. Fetch content + ownership check.
2. If `understandingResult` is non-null and `force !== true`, return cached result.
3. Set `processingStatus = "analyzing"`.
4. Call `AiProvider.understandContent(rawMaterial)`.
5. On success: set `processingStatus = "understood"`, persist `understandingResult`.
6. On failure: set `processingStatus = "failed"`, throw `providerError(...)`.

UNKNOWN: `AiProvider` is a conceptual interface in `architecture.md`. No concrete
implementation file exists yet in the repo (not in `lib/`). The domain service
will depend on it via an injected interface or a thin wrapper module
(e.g., `lib/ai/provider.ts`). Design of the AI provider abstraction is out of
scope for this feature — the domain service will call it as a dependency, and
that dependency must be in place (or stubbed) before implementation.

### R8 — `generateAngles`

RECOMMENDATION: `contentService.generateAngles()`:
1. Fetch content + ownership check.
2. Check `processingStatus`. If not `"understood"` (i.e., `understandingResult`
   is null), call the internal understand step first (same as `understand()` with
   `force: false`). This reuses the cache if available, otherwise runs the AI
   call. This is the AMB-1 Option B resolution.
3. Call `AiProvider.generateAngles(understandingResult, { count })`.
4. Insert returned `angle` rows with `contentId` set, `researchId` as `null`.
   The `angle_exactly_one_parent` CHECK constraint enforces correctness at DB level.
5. Return `{ angles: insertedRows }`.

INFERENCE: Because `generateAngles` may internally trigger `understandContent`,
its `PROVIDER_ERROR` and `RATE_LIMITED` responses can originate from either AI
step. The action doesn't need to distinguish which step failed — the error code
is the same either way (per R8 requirements).

---

## Action File Sketch

```ts
// features/content/actions.ts
"use server";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { contentOriginSchema } from "@/lib/schemas/content";
import * as contentService from "@/lib/domain/content-service";

// R1
export const createContent = authActionClient
  .inputSchema(z.object({
    rawText: z.string().nullable().optional(),
    origin: contentOriginSchema.default("manual"),
    researchId: z.string().uuid().nullable().optional(),
    discoveryItemId: z.string().uuid().nullable().optional(),
    contextMedia: z.array(z.object({
      mediaId: z.string().uuid(),
      note: z.string().nullable().optional(),
    })).optional(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    return contentService.create(ctx.auth.user.id, parsedInput);
  });

// R2
export const updateContent = authActionClient
  .bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
  .inputSchema(z.object({
    rawText: z.string().nullable().optional(),
    origin: contentOriginSchema.optional(),
  }))
  .action(async ({ parsedInput, bindArgsParsedInputs: [contentId], ctx }) => {
    return contentService.update(ctx.auth.user.id, contentId, parsedInput);
  });

// R3
export const deleteContent = authActionClient
  .bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
  .action(async ({ bindArgsParsedInputs: [contentId], ctx }) => {
    return contentService.delete(ctx.auth.user.id, contentId);
  });

// R5
export const addContextMedia = authActionClient
  .bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
  .inputSchema(z.object({
    mediaId: z.string().uuid(),
    note: z.string().nullable().optional(),
  }))
  .action(async ({ parsedInput, bindArgsParsedInputs: [contentId], ctx }) => {
    return contentService.addContextMedia(ctx.auth.user.id, contentId, parsedInput);
  });

// R6
export const removeContextMedia = authActionClient
  .bindArgsSchemas<[contentId: z.ZodString, mediaId: z.ZodString]>(
    [z.string().uuid(), z.string().uuid()]
  )
  .action(async ({ bindArgsParsedInputs: [contentId, mediaId], ctx }) => {
    return contentService.removeContextMedia(ctx.auth.user.id, contentId, mediaId);
  });

// R7
export const analyzeContent = authActionClient
  .bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
  .inputSchema(z.object({ force: z.boolean().optional() }))
  .action(async ({ parsedInput, bindArgsParsedInputs: [contentId], ctx }) => {
    return contentService.understand(ctx.auth.user.id, contentId, parsedInput);
  });

// R8
export const generateAngles = authActionClient
  .bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
  .inputSchema(z.object({
    count: z.number().int().min(1).max(10).optional(),
  }))
  .action(async ({ parsedInput, bindArgsParsedInputs: [contentId], ctx }) => {
    return contentService.generateAngles(ctx.auth.user.id, contentId, parsedInput);
  });
```

Note: `createContent` has no bind args (no pre-existing resource ID). All
mutation actions throw via `AppError` from the domain layer; `handleServerError`
in `lib/safe-action.ts` catches and maps them to `result.serverError`.

---

## `lib/schemas/enums.ts` Extension

FACT: `contentOriginSchema` is not in `lib/schemas/enums.ts` (current file
verified — only `platformSchema`, `experienceLevelSchema`, `writingToneSchema`,
`technicalDepthSchema`, `emojiUsageSchema`, `xPostTypeSchema`,
`draftTargetKindSchema`, `mediaKindSchema`, `publicationModeSchema`).

RECOMMENDATION: Add to `lib/schemas/enums.ts`:

```ts
export const contentOriginSchema = z.enum(["manual", "research", "discovery"]);
```

This keeps all Zod enum schemas in the single shared file, matching the
established pattern.

---

## Testing Strategy

Per `.specs/WORKFLOW.md` Step 6 (unit tests = majority):

| Test file | What it tests |
|---|---|
| `tests/unit/content-service.test.ts` | `create` (happy path, unknown media, foreign researchId, unknown discoveryItemId), `update` (partial, NOT_FOUND), `delete` (happy path, CONFLICT with live pub), `addContextMedia` (happy, duplicate, foreign media), `removeContextMedia` (happy, NOT_FOUND), `understand` (cache hit, cache miss, force, PROVIDER_ERROR status transitions), `generateAngles` (cached understanding reuse, cold start, PROVIDER_ERROR) |

Property test candidates (per `INVARIANT` list in `domain.md`):
- Ownership: resource that exists but isn't owned → NOT_FOUND, never FORBIDDEN
  (touches `architecture.md` ownership rule, not a numbered INVARIANT but
  explicitly called out)
- Content deletion blocked while live Publication exists (checked in
  `domain.md`'s property test candidates list)

These are flagged as RECOMMENDATION — confirm with developer before adding
`fast-check` dependency (per WORKFLOW.md Step 5 rule).

---

## Schema Impact

none

All required tables, columns, constraints, and indexes are present in the current
schema. Verified:

- `content`: all columns used (`rawText`, `origin`, `processingStatus`,
  `understandingResult`, `researchId`, `discoveryItemId`, `userId`) ✓
- `content_context_media`: composite PK `(contentId, mediaId)`, `note` ✓
- `angle`: `contentId`, `researchId`, `label`, `description`,
  `angle_exactly_one_parent` CHECK ✓
- `publication`: RESTRICT FK on `compositionId` ✓
- `composition`: `contentId` FK with cascade ✓
- `discoveryItem`: `archivedAt` for soft-archive check ✓
- `media`: `userId` for ownership check ✓
- `.$onUpdate(() => new Date())` on `content.updatedAt` ✓ (no manual set needed)
