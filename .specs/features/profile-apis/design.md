# Profile Feature Design

## Schema Impact: Minimal

`application_profile.writingInstruction` changes from `text` (unbounded) to `varchar(1000)` to enforce the 1000-char cap at the DB level, consistent with the Zod schema. One `ALTER TABLE` migration via `bun run db:push`.

---

## File Structure

```
app/api/v1/
  profile/
    route.ts               ← GET + PATCH /api/v1/profile
    technologies/
      route.ts             ← GET /api/v1/profile/technologies
    interests/
      route.ts             ← GET /api/v1/profile/interests

lib/domain/
  profile.ts               ← all domain logic (queries, upsert, ID validation, transaction)

lib/schemas/
  profile.ts               ← UpdateProfileInput Zod schema
```

---

## Domain Layer — `lib/domain/profile.ts`

### FACT — `user.technologies` relation uses `.through()` in `db/relations.ts`

The Drizzle relational query for a user's profile can traverse `user → user_technology → technology` via the `.through()` relation (`relations.ts` L22–25), returning `technology[]` directly on the user row. Same pattern for `user → user_interest → interest`.

### FACT — `application_profile.userId` is the PK

Upsert is a single `db.insert(applicationProfile).values(...).onConflictDoUpdate({ target: applicationProfile.userId, set: { ...fields } })`. No separate `WHERE userId = ?` update is needed.

### RECOMMENDATION — `getOrCreateProfile(userId)` as the core read primitive

```ts
async function getOrCreateProfile(userId: string): Promise<ProfileRow>;
```

1. Query `application_profile` by `userId`.
2. If missing, `INSERT` a default row (`preferredPlatforms = []`, all others null).
3. Return the row.

This single function is shared by both `GET` (return current state) and `PATCH` (ensure row exists before upsert).

### RECOMMENDATION — `getProfileWithRelations(userId)` for the full profile response

Single Drizzle relational query on `user` with `with: { applicationProfile: true, technologies: true, interests: true }`. Returns the full profile shape in one round trip.

### RECOMMENDATION — `updateProfile(userId, input)` for PATCH

Steps in order:

1. If `technologyIds` or `interestIds` is provided, validate all IDs against the catalog (query `technology`/`interest` tables, compare sets). If any ID is unknown → throw `validationError` with `fieldErrors`.
2. Open `db.transaction()`:
   a. Upsert `application_profile` with any provided preference fields.
   b. If `technologyIds` provided: delete all `user_technology` rows for userId, then batch insert new ones.
   c. If `interestIds` provided: delete all `user_interest` rows for userId, then batch insert new ones.
3. Return full profile via `getProfileWithRelations(userId)`.

### INFERENCE — Empty `{}` body is a valid no-op

`UpdateProfileInput` is an all-optional Zod schema. If no fields are present, step 2a runs an upsert with no changed values (idempotent), and steps 2b/2c are skipped. Returns current profile unchanged.

### RECOMMENDATION — Catalog reads are thin queries

```ts
async function listTechnologies(): Promise<{ id: string; name: string }[]>;
async function listInterests(): Promise<{ id: string; name: string }[]>;
```

Simple `db.select().from(technology).orderBy(asc(technology.name))`. No user context needed — catalog is global.

---

## Zod Schemas — `lib/schemas/profile.ts`

### FACT — Enum values come from `db/schema/enums.ts`

```ts
import { z } from "zod";

export const ExperienceLevelSchema = z.enum([
	"student",
	"junior",
	"mid_level",
	"senior",
]);
export const PlatformSchema = z.enum(["linkedin", "x"]);
export const WritingToneSchema = z.enum(["casual", "balanced", "formal"]);
export const TechnicalDepthSchema = z.enum([
	"beginner_friendly",
	"detailed",
	"expert",
]);
export const EmojiUsageSchema = z.enum(["none", "minimal", "frequent"]);

export const UpdateProfileInput = z.object({
	experienceLevel: ExperienceLevelSchema.nullable().optional(),
	preferredPlatforms: z.array(PlatformSchema).optional(),
	writingTone: WritingToneSchema.nullable().optional(),
	technicalDepth: TechnicalDepthSchema.nullable().optional(),
	emojiUsage: EmojiUsageSchema.nullable().optional(),
	writingInstruction: z.string().max(1000).nullable().optional(),
	technologyIds: z.array(z.string().uuid()).optional(),
	interestIds: z.array(z.string().uuid()).optional(),
});

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInput>;
```

### RECOMMENDATION — UUID validation on IDs

`technologyIds` and `interestIds` elements are validated as UUIDs at the Zod boundary. Any non-UUID string is rejected before it reaches the DB ID existence check.

---

## Route Handlers

### RECOMMENDATION — `GET /api/v1/profile` route shape

```ts
// app/api/v1/profile/route.ts
export async function GET(request: Request) {
	return withApiHandler(request, async ({ user }) => {
		return getProfileWithRelations(user.id);
	});
}
```

`getProfileWithRelations` internally calls `getOrCreateProfile` then joins technologies + interests.

### RECOMMENDATION — `PATCH /api/v1/profile` route shape

```ts
export async function PATCH(request: Request) {
	return withApiHandler(request, async ({ user }) => {
		const input = await validateBody(request, UpdateProfileInput);
		return updateProfile(user.id, input);
	});
}
```

### RECOMMENDATION — Catalog route shape

```ts
// app/api/v1/profile/technologies/route.ts
export async function GET(request: Request) {
	return withApiHandler(request, async () => {
		const items = await listTechnologies();
		return { items };
	});
}
```

Same shape for `/interests/route.ts`.

---

## ID Validation Strategy

### RECOMMENDATION — Validate before write with fieldErrors

```ts
// In updateProfile(), before the transaction:
if (input.technologyIds) {
	const found = await db
		.select({ id: technology.id })
		.from(technology)
		.where(inArray(technology.id, input.technologyIds));

	const foundSet = new Set(found.map((r) => r.id));
	const invalid = input.technologyIds.filter((id) => !foundSet.has(id));
	if (invalid.length > 0) {
		throw validationError("Invalid technology IDs", {
			technologyIds: invalid.map((id) => `Unknown ID: ${id}`),
		});
	}
}
// Same pattern for interestIds
```

Both validations run before the transaction opens (A-03 from analysis).

---

## RESOLVED

- **`writingInstruction` max length:** Confirmed **1000 chars**. Enforced at both layers:
  - Zod: `z.string().max(1000)`
  - DB: `varchar(1000)` column (replaces `text`). Migration applied via `bun run db:push`.
