# Profile Requirements

## Scope

Implement the authenticated user profile API: fetch and update core preferences (experience level, preferred platforms, writing style) and manage the user's technology/interest selections from the global pre-seeded catalog.

---

## Requirements (EARS)

### REQ-P-01 — Fetch Profile (`GET /api/v1/profile`)

- **Event-driven:** When an authenticated user requests their profile, the system shall return their `application_profile` row joined with their selected technologies (via `user_technology`) and interests (via `user_interest`).
- **State:** If no `application_profile` row exists yet for the user, the system shall return a profile with all preference fields as `null` and empty arrays for technologies and interests.
  - _Consistent with:_ `docs/domain.md` — Application Profile is 1:1 with user; `docs/architecture.md` — ownership derived from session.
  - _Schema impact:_ None. Reads `application_profile`, `user_technology`, `technology`, `user_interest`, `interest`.

### REQ-P-02 — Update Profile (`PATCH /api/v1/profile`)

- **Event-driven:** When an authenticated user submits a partial profile update, the system shall upsert the `application_profile` row with only the provided fields and return the full updated profile in the `GET` shape.
- **State:** Fields not included in the request body shall not be modified.
- **Constraint:** `experienceLevel` must be one of `student | junior | mid_level | senior | null` — invalid values shall return `422 VALIDATION_ERROR`.
- **Constraint:** `preferredPlatforms` must contain only `"linkedin"` or `"x"` — invalid values shall return `422 VALIDATION_ERROR`.
- **Constraint:** `writingTone`, `technicalDepth`, `emojiUsage` must be within their respective enum sets — invalid values shall return `422 VALIDATION_ERROR`.
  - _Consistent with:_ `docs/api-contract.md` §5; `db/schema/enums.ts` for valid enum values.
  - _Schema impact:_ None. Upserts `application_profile`.

### REQ-P-03 — Replace Technology Selections (`PATCH /api/v1/profile` with `technologyIds`)

- **Event-driven:** When `technologyIds` is provided in the patch body, the system shall replace the user's full `user_technology` selection with the provided IDs.
- **Constraint:** All provided `technologyIds` must exist in the `technology` table — any unknown ID shall return `422 VALIDATION_ERROR` with the invalid ID in `fieldErrors`.
- **State:** Providing an empty `technologyIds: []` shall remove all technology associations for the user.
  - _Consistent with:_ `db/schema/profile.ts` — `user_technology` is a junction table with `(userId, technologyId)` as composite PK.
  - _Schema impact:_ None. Replaces rows in `user_technology`.

### REQ-P-04 — Replace Interest Selections (`PATCH /api/v1/profile` with `interestIds`)

- **Event-driven:** When `interestIds` is provided in the patch body, the system shall replace the user's full `user_interest` selection with the provided IDs.
- **Constraint:** All provided `interestIds` must exist in the `interest` table — any unknown ID shall return `422 VALIDATION_ERROR` with the invalid ID in `fieldErrors`.
- **State:** Providing an empty `interestIds: []` shall remove all interest associations for the user.
  - _Consistent with:_ `db/schema/profile.ts` — `user_interest` is a junction table with `(userId, interestId)` as composite PK.
  - _Schema impact:_ None. Replaces rows in `user_interest`.

### REQ-P-05 — List Available Technologies (`GET /api/v1/profile/technologies`)

- **Event-driven:** When an authenticated user requests the technology catalog, the system shall return all rows from the `technology` table ordered alphabetically by name.
  - _Consistent with:_ Pre-seeded catalog decision; `db/schema/profile.ts`.
  - _Schema impact:_ None. Read-only on `technology`.

### REQ-P-06 — List Available Interests (`GET /api/v1/profile/interests`)

- **Event-driven:** When an authenticated user requests the interest catalog, the system shall return all rows from the `interest` table ordered alphabetically by name.
  - _Consistent with:_ Pre-seeded catalog decision; `db/schema/profile.ts`.
  - _Schema impact:_ None. Read-only on `interest`.

---

## Out of Scope (V1)

- Onboarding wizard state machine (`GET/PUT /api/v1/onboarding`)
- Profile completeness percentage calculation
- Custom user-created technologies or interests
- Technology/interest search/filtering (full list returned; client handles filtering)
