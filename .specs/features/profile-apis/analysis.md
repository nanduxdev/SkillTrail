# Profile Feature Analysis

## Status: CLOSED — all items resolved

---

## Contradictions

### C-01 — `isCustom` field removed from schema but still present in `api-contract.md`

**RESOLVED:** `isCustom` has been removed from the `GET /api/v1/profile` response shape in `docs/api-contract.md` §5. Implementation must not return this field.

---

## Gaps

### G-01 — First-time profile row creation

**RESOLVED:** Lazy auto-create on first `GET /api/v1/profile`. The domain service shall insert a default `application_profile` row (all nullable fields null, `preferredPlatforms = []`) when no row exists for the authenticated user, then return the freshly created row. This keeps `PATCH` upsert logic trivial.

### G-02 — Catalog endpoints not in `api-contract.md`

**RESOLVED:** `GET /api/v1/profile/technologies` and `GET /api/v1/profile/interests` have been added to `docs/api-contract.md` §5. Both return all pre-seeded rows alphabetically; client handles filtering.

### G-03 — Replace semantics require DB transaction

**RESOLVED:** `technologyIds`/`interestIds` updates use a transaction-wrapped full replace: validate all IDs → delete existing junction rows → insert new junction rows. Lives in `lib/domain/profile.ts`.

---

## Ambiguities

### A-01 — Ownership

**RESOLVED:** `application_profile.userId` is the PK and equals `session.user.id`. No additional ownership check required.

### A-02 — Empty `PATCH {}` body

**RESOLVED:** An empty body is a valid no-op. The domain service runs the upsert with no changed fields and returns the current profile. Route handler validates via `validateBody(UpdateProfileInput)` using Zod — all fields are optional so an empty object passes validation.

### A-03 — ID validation order

**RESOLVED:** Validate **all** `technologyIds` and `interestIds` against the catalog **before** any DB write. If any ID is unknown, return `422 VALIDATION_ERROR` with the invalid IDs in `fieldErrors`. Partial writes are not permitted.

---

## Implementation Notes (carry into design)

- **Zod validation at route boundary:** Route handlers use `await validateBody(request, UpdateProfileInput)` from `lib/api/validation.ts`. `UpdateProfileInput` is an all-optional Zod object; an empty `{}` body is valid.
- **Domain layer:** All queries, transaction logic, and ID validation live in `lib/domain/profile.ts`. Route handlers stay thin.
- **Transaction boundary:** The `user_technology` / `user_interest` replace must be atomic — use Drizzle's `db.transaction()`.
- **Catalog reads:** `GET /api/v1/profile/technologies` and `/interests` are simple ordered reads with no ownership concern.
