# Design — server-actions-migration

## Approach

(RECOMMENDATION)

Transport-only migration for existing entry points.

1. `lib/safe-action.ts` — `actionClient` + `authActionClient` with Better Auth adapter `authorize` throwing `AppError("UNAUTHENTICATED")`. Flattened validation errors. `handleServerError` returns `AppServerError`.
2. `lib/errors.ts` — `AppError` without HTTP status; keep `validationError` / `unauthenticated` plus contract helpers including `aiProposalPending`.
3. `lib/schemas/enums.ts` — shared enums; `lib/schemas/profile.ts` re-exports / uses them; keep `writingInstruction` max 1000.
4. Profile: `features/profile/queries.ts` → `getProfileWithRelations`; `features/profile/actions.ts` → `updateProfile`, `searchTechnologies`, `searchInterests`. Domain stays in `lib/domain/profile.ts`. Unknown catalog IDs: domain throws `validationError`; action maps to `returnValidationErrors`.
5. Early access: `lib/domain/early-access.ts`; `features/early-access/actions.ts` `joinEarlyAccess`. Marketing preference: `lib/domain/notification-preference.ts` + `features/notifications/actions.ts`.
6. Delete profile Route Handlers and `lib/api/*` after grep shows no consumers. Keep Better Auth route.
7. Landing page reads `result.data` / `result.validationErrors`.
8. Minimal `docs/architecture.md` Domain Layer Rule update.

## Files touched / created

Created:

- `.specs/features/server-actions-migration/*`
- `lib/safe-action.ts`
- `lib/errors.ts`
- `lib/schemas/enums.ts`
- `features/profile/actions.ts`
- `features/profile/queries.ts`
- `lib/domain/early-access.ts`
- `features/early-access/actions.ts`
- `lib/domain/notification-preference.ts`
- `features/notifications/actions.ts`
- `tests/actions/profile.test.ts`
- `tests/actions/early-access.test.ts`
- `tests/unit/domain/profile.test.ts`
- `tests/unit/domain/early-access.test.ts` (if useful)

Changed:

- `lib/domain/profile.ts` (errors import; optional catalog query filter)
- `lib/schemas/profile.ts`
- `app/(marketing)/page.tsx`
- `docs/architecture.md`

Removed:

- `app/api/v1/profile/**`
- `lib/api/**`
- `lib/actions.ts`
- `tests/api/profile.test.ts`

Unchanged:

- `app/api/v1/auth/[...all]/route.ts`

## Domain layer placement

All persistence and business rules remain in `lib/domain/*`. Actions/queries call those functions. No Trigger.dev tasks exist yet.

## Schema Impact

none
