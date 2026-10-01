# Analysis — content-actions

## Contradictions

### C1 — R1 ownership check on `discoveryItemId` is semantically wrong

**R1** states: "SHALL return `serverError.code: NOT_FOUND` if `discoveryItemId`
is provided but does not exist **or does not belong to the authenticated user**."

**FACT:** `discovery_item` is a **global, unowned** table (`db/schema/discovery.ts`
— no `userId` column; comment: "Global, unowned. Ingested by a background
Trigger.dev job."). Discovery items have no owner — they belong to no user.

**INFERENCE:** The ownership check as written cannot be implemented. The correct
check is only existence: `discoveryItemId` must refer to a row that exists and is
not archived (`archivedAt IS NULL` — per the schema comment "soft-archive out of
the active feed"). A user cannot "own" a discovery item.

**Also note (`docs/domain.md` Discovery):** "When a user clicks 'Create Post'
from a discovery item, the discovery context is opt-in (checkbox confirmation),
not automatic." The traceability link (`content.discoveryItemId`) is stored by
`SET NULL ON DELETE`, meaning it is soft: it is best-effort provenance, not a
required FK check. However, the contract still implies the ID must be a real,
accessible discovery item.

**Resolution required:** Rewrite R1's `discoveryItemId` clause to:

> AND SHALL return `serverError.code: NOT_FOUND` if `discoveryItemId` is
> provided but does not refer to an existing (non-archived) discovery item.
> _(No ownership check — `discoveryItem` is a global table with no `userId`.)_

---

### C2 — R3 CONFLICT detection is not enforced by the RESTRICT FK alone

**R3** states: "SHALL return `serverError.code: CONFLICT`… if any live
Publication exists anywhere in the content's composition tree."

**FACT:** `publication.compositionId` references `composition.id` with
`ON DELETE RESTRICT` (`db/schema/publication.ts` L34–35). When Postgres rejects
the `DELETE` because of the RESTRICT FK, it throws a foreign key violation
(`23503`). The code currently has no evidence of intercepting that Postgres error
code and translating it into `CONFLICT` — nor does `lib/errors.ts` document it.

**INFERENCE:** The domain service (`contentService.delete`) must either:
(a) pre-query for live publications before attempting the DELETE and throw
`conflict()` proactively, OR
(b) catch the Postgres `23503` error and re-throw as `AppError("CONFLICT")`.

The requirement as written implies the behavior is correct but does not specify
which implementation path the domain layer uses.

**Not a contradiction in the requirement** — the behavior (CONFLICT) is right.
But this is a **gap** (see G2 below) that must be resolved in design: the
domain layer needs an explicit strategy.

**RESOLVED:** `contentService.delete` shall pre-query for live publications
before attempting the `DELETE` and throw `conflict()` proactively (Option a).
This keeps the FK violation as a safety net only.

---

## Gaps

### G1 — R7 (`analyzeContent`): `processingStatus` during in-flight AI call is
unspecified

**R7** says the action returns `{ processingStatus: "understood", ... }` on
success and returns `PROVIDER_ERROR` on failure.

**Gap:** The requirements do not specify what `processingStatus` is set to
**while** the AI call is in flight (i.e., before it resolves). The schema enum
has `"analyzing"` — which exists for exactly this transitional state
(`db/schema/enums.ts` — `contentProcessingStatusEnum` includes `"analyzing"`
and `"failed"`).

**Gap detail:** If `analyzeContent` is synchronous (runs within the request/
response lifecycle, per `docs/architecture.md` — "interactive AI operations stay
synchronous"), then:
- `processingStatus` should be set to `"analyzing"` before the AI call
- Set to `"understood"` (and `understandingResult` written) on success
- Set to `"failed"` on `PROVIDER_ERROR`

The failure path is also absent: R7 specifies `PROVIDER_ERROR` as the error code
but does not specify that `processingStatus` must be set to `"failed"` on error.

**Resolution:** Add two clauses to R7:
1. SHALL set `processingStatus` to `"analyzing"` before invoking the AI provider
2. SHALL set `processingStatus` to `"failed"` if the AI provider call fails
   (in addition to returning `serverError.code: PROVIDER_ERROR`)

---

### G2 — R3: No specification of the domain-layer CONFLICT detection strategy

Noted under C2. This is a gap (not a contradiction) because the behavior is
correct but the implementation path in `contentService.delete` is unspecified.

The domain layer rule (`docs/architecture.md`) states business logic must not
live in Server Actions or Route Handlers. If the FK violation is caught in the
action rather than the domain service, that is an architectural violation.

**Resolution for design.md:** Domain service must own the CONFLICT detection —
either via a pre-query or by catching and translating the Postgres FK violation
error code. The action is only a thin transport adapter.

---

### G3 — R1: No `updatedAt` behavior specified on create

Minor. `content.updatedAt` defaults to `now()` at the schema level
(`db/schema/content.ts`), so this is not a behavioral gap in the requirement —
it just isn't stated. Low-risk; no resolution needed.

---

### G4 — R2: No specification of `updatedAt` on update

When fields are updated, `content.updatedAt` must also be refreshed.

**RESOLVED:** `db/schema/content.ts` line 51 confirms `.$onUpdate(() => new Date())`
is set on `updatedAt` for the `content` table. Drizzle handles this automatically
on any `.update()` call — no explicit `updatedAt: new Date()` needed in the domain
service. Same pattern confirmed across all schema files. Gap is closed at the
schema level.

---

### G5 — R1: Behavior when `contextMedia` contains duplicate `mediaId` values
within the same request is unspecified

R1 covers the case where a `mediaId` doesn't exist or belongs to another user,
but not the case where the caller sends the same `mediaId` twice within one
`contextMedia` array.

**FACT:** `content_context_media` has composite PK `(contentId, mediaId)` — a
duplicate within the same create request would cause a DB unique violation.

**RESOLVED:** Domain service shall deduplicate `mediaId` values server-side
(using a `Set`) before inserting `content_context_media` rows. Silent dedup is
simpler UX than a validation error for a caller who passes the same ID twice.
No change to requirements needed.

---

### G6 — R4: No error path specified when `getContent` is called for a
non-existent or foreign-owned item from a Server Component

R4 says the function "throws a domain NOT_FOUND error." The requirements don't
specify how the Server Component calling it should handle this — e.g., whether
to pass it to Next.js's `notFound()` boundary or let it propagate.

**Assessment:** This is an application-layer concern, not a domain invariant. Low
risk. Document the convention in design.md: Server Components calling
`getContent` should wrap in a try/catch and call Next.js `notFound()` on
`AppError("NOT_FOUND")`. No change to R4 needed.

---

### G7 — R8 (`generateAngles`): No minimum `understandingResult` precondition
stated

**Domain semantics:** `generateAngles` calls `AiProvider.generateAngles(input:
ContentUnderstanding)` (per `docs/architecture.md` AI interface). The AI
provider's `generateAngles` requires a `ContentUnderstanding` as input — which
implies the content must have been understood first.

**RESOLVED (AMB-1, Option B):** `generateAngles` in the domain service shall
ensure understanding exists internally — reusing the cached `understandingResult`
when `processingStatus = "understood"`, otherwise running understanding first
(same logic as `analyzeContent` with `force: false`). No `BAD_REQUEST` is returned
for unanalyzed content. `understandingResult` and `processingStatus` are internal
cache/checkpoint columns; no UX step or confirmation gate is exposed to the user.
See AMB-1 below. Requirements.md R8 will be updated to reflect this.

---

## Ambiguities Requiring a Decision

### AMB-1 — Does `generateAngles` require `processingStatus = "understood"` as a
precondition?

**RESOLVED — Option B (developer decision, 2026-10-02):**

The user sees one step: add context, hit "Create angles". `generateAngles` in
the domain service ensures an understanding exists — reusing the cached result
when valid — then generates angles. `understandingResult` and `processingStatus`
are internal cache and checkpoint columns. No UX step is shown for them, and no
confirmation gate is added. `generateAngles` SHALL NOT return `BAD_REQUEST` when
content is not yet understood.

→ `requirements.md` R8 updated to reflect this.

---

## Resolution

- [x] C1 — Fixed in `requirements.md`: `discoveryItemId` existence-only check
      (no ownership — global table). Done.
- [x] G1 — Fixed in `requirements.md`: `processingStatus` transitions added to
      R7 (`"analyzing"` pre-call, `"failed"` on error). Done.
- [x] AMB-1 — Resolved: Option B. `generateAngles` ensures understanding
      internally; no BAD_REQUEST; no exposed UX step. `requirements.md` R8
      updated.
- [x] G2 — Resolved: `contentService.delete` shall pre-query for live
      publications and throw `conflict()` proactively. Design-phase note only;
      no requirements change.
- [x] G4 — Resolved: `.$onUpdate(() => new Date())` confirmed in
      `db/schema/content.ts` — Drizzle handles `updatedAt` automatically.
      No domain-layer action needed.
- [x] G5 — Resolved: domain service deduplicates `mediaId` values server-side
      (Set) before inserting. Design-phase note only.
- [x] G6 — Resolved: Server Components call Next.js `notFound()` on
      `AppError("NOT_FOUND")` from `getContent`. Design-phase convention.

**All items closed. Gate is open for `/spec-design`.**
