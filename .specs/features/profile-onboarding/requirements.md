# Profile Onboarding Requirements

## Scope

Consolidate the multi-step onboarding wizard and general profile updates into unified state-machine endpoints to make the backend simpler to maintain and the frontend resilient to mid-flow exits.

## Requirements (EARS)

### 1. Onboarding State (`GET /api/v1/onboarding`)

- **Event-driven:** When the user requests their onboarding state, the API shall return whether onboarding is `completed`, the `currentStep`, a boolean map of completed `steps`, and the current `profile` selections.
  - _Consistent with:_ `docs/api-contract.md` (GET /api/v1/onboarding)
  - _Schema impact:_ None (relies on reading `application_profile`).

### 2. Onboarding Options (`GET /api/v1/onboarding/options`)

- **Event-driven:** When the user requests onboarding options, the API shall return the full list of selectable values for experience levels, platforms, writing tones, technical depths, emoji usage, and available global technologies/interests.
  - _Consistent with:_ `docs/api-contract.md` (GET /api/v1/onboarding/options)
  - _Schema impact:_ None.

### 3. Save Onboarding Progress (`PUT /api/v1/onboarding`)

- **Event-driven:** When the user submits partial onboarding data, the API shall upsert the provided fields into the user's profile and return the updated profile along with the `completed` status.
  - _Consistent with:_ `docs/api-contract.md` (PUT /api/v1/onboarding)
  - _Schema impact:_ None.

### 4. Finalize Onboarding (`POST /api/v1/onboarding/complete`)

- **Event-driven:** When the user requests to complete onboarding, the API shall validate that all required profile fields have been set.
- **Unwanted behavior:** If required information is missing, the API shall return an error with code `ONBOARDING_INCOMPLETE` preventing finalization.
- **Event-driven:** When validation passes, the API shall mark the user's onboarding as finalized and return the completed profile.
  - _Consistent with:_ `docs/api-contract.md` (POST /api/v1/onboarding/complete)
  - _Schema impact:_ Requires checking if `onboarding_completed_at` or similar completion flags exist in `application_profile`, or using presence of required fields to derive completion. (Will determine in analysis).

### 5. Fetch Profile (`GET /api/v1/profile`)

- **Event-driven:** When the user requests their profile outside of onboarding, the API shall return their full profile including resolved custom technologies and interests.
  - _Consistent with:_ `docs/api-contract.md` (GET /api/v1/profile)
  - _Schema impact:_ None.

### 6. Update Profile (`PATCH /api/v1/profile`)

- **Event-driven:** When the user submits a partial profile update, the API shall update the profile fields and relationships (technologies/interests), then return the updated profile.
  - _Consistent with:_ `docs/api-contract.md` (PATCH /api/v1/profile)
  - _Schema impact:_ None.
