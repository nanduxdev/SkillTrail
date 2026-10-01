# Requirements — server-actions-migration

workflow: requirements-first
status: accepted

## Scope

Migrate existing SkillTrail application entry points from HTTP Route Handlers / ad-hoc Server Actions onto the Server Actions contract in `docs/actions-contract.md`. Domain behavior is unchanged unless that contract explicitly requires a different error channel.

Unimplemented product surfaces (content, drafts, media, OAuth, publications, research, discovery, notifications CRUD, history) SHALL NOT be implemented as part of this change.

---

## R1 — Shared action client

WHEN the application defines a Server Action
THEN the system SHALL use `actionClient` or `authActionClient` from `lib/safe-action.ts`
AND SHALL NOT hand-roll Better Auth session checks inside each action
AND SHALL map `AppError` through `handleServerError` into `result.serverError` with `{ code, message, details }`
AND SHALL use `defaultValidationErrorsShape: "flattened"`
AND SHALL NOT use Next.js `unauthorized()` / `authInterrupts` for unauthenticated actions

Consistent with: no directly related invariant; `docs/architecture.md` Domain Layer Rule; `docs/actions-contract.md` §3–4
Schema impact: none

## R2 — Profile initial read

WHEN an authenticated caller needs the current application profile for a server-rendered page
THEN the system SHALL load it via `getProfile(userId)` in `features/profile/queries.ts` calling the existing profile domain service
AND SHALL CONTINUE TO auto-create a default `application_profile` row when none exists
AND SHALL NOT expose `GET /api/v1/profile`

Consistent with: Application Profile is 1:1 with user (`docs/domain.md`)
Schema impact: none

## R3 — Profile update

WHEN an authenticated client submits a profile patch
THEN the system SHALL invoke the `updateProfile` Server Action (`authActionClient` + `UpdateProfileInput`)
AND SHALL CONTINUE TO upsert only provided fields, treat `{}` as a no-op, and full-replace `technologyIds` / `interestIds` in a transaction
AND unknown catalog IDs SHALL surface as `result.validationErrors.fieldErrors`, not `serverError`
AND SHALL NOT expose `PATCH /api/v1/profile`

Consistent with: `docs/actions-contract.md` §8; existing profile domain rules
Schema impact: none

## R4 — Catalog search reads

WHEN an authenticated client searches technologies or interests
THEN the system SHALL invoke `searchTechnologies` / `searchInterests` read Server Actions
AND an omitted or empty `query` SHALL return the full alphabetical catalog
AND a non-empty `query` SHALL return a case-insensitive name-contains subset
AND SHALL NOT expose `GET /api/v1/profile/technologies` or `GET /api/v1/profile/interests`

Consistent with: `docs/actions-contract.md` §8
Schema impact: none

## R5 — Early access

WHEN an unauthenticated visitor submits a valid email on the landing page
THEN the system SHALL invoke public `joinEarlyAccess`
AND a duplicate email SHALL be reported as `validationErrors` on `email` (not `CONFLICT` / `ALREADY_SUBSCRIBED`)
AND SHALL NOT insert via a Route Handler or an ad-hoc action that talks to Drizzle directly

Consistent with: no directly related invariant; `docs/actions-contract.md` §24
Schema impact: none

## R6 — Marketing email preference (existing helper only)

WHEN `setMarketingEmailPreference` is invoked by an authenticated user
THEN the system SHALL upsert `notification_preference.marketingEmailsEnabled = true` through a domain helper and `authActionClient`
AND SHALL NOT implement the rest of notification preferences from the contract

Consistent with: no directly related invariant
Schema impact: none

## R7 — Retained HTTP

WHEN SkillTrail handles application auth
THEN Better Auth SHALL CONTINUE TO own `/api/v1/auth/*`
AND SkillTrail SHALL NOT add application routes under that prefix
AND unused OAuth / `x/external-posts` Route Handlers SHALL NOT be created

Consistent with: `docs/architecture.md` Auth Architecture
Schema impact: none

## R8 — Domain boundary

WHEN a Server Action or query runs
THEN it SHALL remain a thin adapter over `lib/domain/*`
AND SHALL NOT contain Drizzle queries, ownership rules, or transactions
AND Trigger.dev tasks, if added later, SHALL call domain services directly (not actions or HTTP)

Consistent with: `docs/architecture.md` Domain Layer Rule
Schema impact: none
