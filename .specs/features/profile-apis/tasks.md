# Profile Feature Tasks

## Status: Ready for implementation

Schema Impact: `varchar(1000)` on `application_profile.writing_instruction` — already applied via `bun run db:push`.

---

## Checklist

### 1. Zod schema — `lib/schemas/profile.ts` [NEW]

- [x] Create `lib/schemas/profile.ts`
- [x] Define enum schemas mirroring `db/schema/enums.ts`: `ExperienceLevelSchema`, `PlatformSchema`, `WritingToneSchema`, `TechnicalDepthSchema`, `EmojiUsageSchema`
- [x] Define `UpdateProfileInput` (all fields optional; `writingInstruction` capped at `z.string().max(1000)`)
- [x] Export `UpdateProfileInputType` inferred type

### 2. Domain service — `lib/domain/profile.ts` [NEW]

- [x] Create `lib/domain/profile.ts`
- [x] Implement `getOrCreateProfile(userId: string)` — query `application_profile`, insert default row if missing
- [x] Implement `getProfileWithRelations(userId: string)` — relational query returning full profile shape (joins technologies + interests via `.through()` relations)
- [x] Implement `listTechnologies()` — `SELECT id, name FROM technology ORDER BY name ASC`
- [x] Implement `listInterests()` — `SELECT id, name FROM interest ORDER BY name ASC`
- [x] Implement `updateProfile(userId, input)`:
  - [x] Validate `technologyIds` against catalog (if provided); throw `validationError` with `fieldErrors` if any ID unknown
  - [x] Validate `interestIds` against catalog (if provided); throw `validationError` with `fieldErrors` if any ID unknown
  - [x] Open `db.transaction()`:
    - [x] Upsert `application_profile` with provided preference fields via `onConflictDoUpdate`
    - [x] If `technologyIds` provided: delete all `user_technology` rows for user, batch insert new ones
    - [x] If `interestIds` provided: delete all `user_interest` rows for user, batch insert new ones
  - [x] Return `getProfileWithRelations(userId)`

### 3. Route handlers

- [x] Create `app/api/v1/profile/route.ts` [NEW]
  - [x] `GET` → `withApiHandler` → `getProfileWithRelations(user.id)`
  - [x] `PATCH` → `withApiHandler` → `validateBody(request, UpdateProfileInput)` → `updateProfile(user.id, input)`
- [x] Create `app/api/v1/profile/technologies/route.ts` [NEW]
  - [x] `GET` → `withApiHandler` → `listTechnologies()` → return `{ items }`
- [x] Create `app/api/v1/profile/interests/route.ts` [NEW]
  - [x] `GET` → `withApiHandler` → `listInterests()` → return `{ items }`

### 4. Tests — `tests/api/profile.test.ts` [NEW]

- [x] `GET /api/v1/profile` — auto-creates row for new user; returns profile shape
- [x] `GET /api/v1/profile` — returns existing profile with selected technologies + interests
- [x] `PATCH /api/v1/profile` — updates preference fields; omitted fields unchanged
- [x] `PATCH /api/v1/profile` with `{}` body — valid no-op; returns current profile
- [x] `PATCH /api/v1/profile` with valid `technologyIds` — replaces selections
- [x] `PATCH /api/v1/profile` with unknown `technologyIds` — returns 422 with `fieldErrors`
- [x] `PATCH /api/v1/profile` with unknown `interestIds` — returns 422 with `fieldErrors`
- [x] `PATCH /api/v1/profile` with `technologyIds: []` — removes all technology selections
- [x] `GET /api/v1/profile/technologies` — returns all catalog entries sorted alphabetically
- [x] `GET /api/v1/profile/interests` — returns all catalog entries sorted alphabetically
- [x] All routes — 401 if no session
