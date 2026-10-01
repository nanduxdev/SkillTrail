import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import {
	applicationProfile,
	interest,
	technology,
	userInterest,
	userTechnology,
} from "../../db/schema/profile";
import { validationError } from "../errors";
import type { UpdateProfileInputType } from "../schemas/profile";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileResponse {
	userId: string;
	experienceLevel: "student" | "junior" | "mid_level" | "senior" | null;
	preferredPlatforms: Array<"linkedin" | "x">;
	writingTone: "casual" | "balanced" | "formal" | null;
	technicalDepth: "beginner_friendly" | "detailed" | "expert" | null;
	emojiUsage: "none" | "minimal" | "frequent" | null;
	writingInstruction: string | null;
	technologies: Array<{ id: string; name: string }>;
	interests: Array<{ id: string; name: string }>;
}

// ─── Read ──────────────────────────────────────────────────────────────────────

/**
 * Lazily auto-creates the application_profile row on first access (G-01).
 */
async function getOrCreateProfile(userId: string) {
	const [existing] = await db
		.select()
		.from(applicationProfile)
		.where(eq(applicationProfile.userId, userId))
		.limit(1);

	if (existing) return existing;

	const [created] = await db
		.insert(applicationProfile)
		.values({ userId })
		.returning();

	return created;
}

/**
 * Returns the full profile response shape joined with technologies and interests.
 */
export async function getProfileWithRelations(
	userId: string,
): Promise<ProfileResponse> {
	const profile = await getOrCreateProfile(userId);

	const [userTechs, userInterests] = await Promise.all([
		db
			.select({ id: technology.id, name: technology.name })
			.from(userTechnology)
			.innerJoin(technology, eq(technology.id, userTechnology.technologyId))
			.where(eq(userTechnology.userId, userId)),
		db
			.select({ id: interest.id, name: interest.name })
			.from(userInterest)
			.innerJoin(interest, eq(interest.id, userInterest.interestId))
			.where(eq(userInterest.userId, userId)),
	]);

	return {
		userId: profile.userId,
		experienceLevel: profile.experienceLevel ?? null,
		preferredPlatforms:
			(profile.preferredPlatforms as Array<"linkedin" | "x">) ?? [],
		writingTone: profile.writingTone ?? null,
		technicalDepth: profile.technicalDepth ?? null,
		emojiUsage: profile.emojiUsage ?? null,
		writingInstruction: profile.writingInstruction ?? null,
		technologies: userTechs,
		interests: userInterests,
	};
}

// ─── Catalog reads ────────────────────────────────────────────────────────────

function filterCatalog(
	items: Array<{ id: string; name: string }>,
	query?: string,
): Array<{ id: string; name: string }> {
	const needle = query?.trim().toLowerCase();
	if (!needle) return items;
	return items.filter((item) => item.name.toLowerCase().includes(needle));
}

export async function listTechnologies(
	query?: string,
): Promise<Array<{ id: string; name: string }>> {
	const items = await db
		.select({ id: technology.id, name: technology.name })
		.from(technology)
		.orderBy(asc(technology.name));

	return filterCatalog(items, query);
}

export async function listInterests(
	query?: string,
): Promise<Array<{ id: string; name: string }>> {
	const items = await db
		.select({ id: interest.id, name: interest.name })
		.from(interest)
		.orderBy(asc(interest.name));

	return filterCatalog(items, query);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProfile(
	userId: string,
	input: UpdateProfileInputType,
): Promise<ProfileResponse> {
	// Validate technologyIds before any write (A-03)
	if (input.technologyIds !== undefined && input.technologyIds.length > 0) {
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

	// Validate interestIds before any write (A-03)
	if (input.interestIds !== undefined && input.interestIds.length > 0) {
		const found = await db
			.select({ id: interest.id })
			.from(interest)
			.where(inArray(interest.id, input.interestIds));

		const foundSet = new Set(found.map((r) => r.id));
		const invalid = input.interestIds.filter((id) => !foundSet.has(id));

		if (invalid.length > 0) {
			throw validationError("Invalid interest IDs", {
				interestIds: invalid.map((id) => `Unknown ID: ${id}`),
			});
		}
	}

	// Build only the fields that were provided (no-op if empty object)
	const profileFields: Partial<typeof applicationProfile.$inferInsert> = {};
	if (input.experienceLevel !== undefined)
		profileFields.experienceLevel = input.experienceLevel;
	if (input.preferredPlatforms !== undefined)
		profileFields.preferredPlatforms = input.preferredPlatforms;
	if (input.writingTone !== undefined)
		profileFields.writingTone = input.writingTone;
	if (input.technicalDepth !== undefined)
		profileFields.technicalDepth = input.technicalDepth;
	if (input.emojiUsage !== undefined)
		profileFields.emojiUsage = input.emojiUsage;
	if (input.writingInstruction !== undefined)
		profileFields.writingInstruction = input.writingInstruction;

	// Transaction: upsert profile + replace junction rows atomically (G-03)
	await db.transaction(async (tx) => {
		// Always upsert to ensure the row exists (G-01)
		await tx
			.insert(applicationProfile)
			.values({ userId, ...profileFields })
			.onConflictDoUpdate({
				target: applicationProfile.userId,
				set: {
					...profileFields,
					updatedAt: new Date(),
				},
			});

		if (input.technologyIds !== undefined) {
			await tx.delete(userTechnology).where(eq(userTechnology.userId, userId));

			if (input.technologyIds.length > 0) {
				await tx.insert(userTechnology).values(
					input.technologyIds.map((technologyId) => ({
						userId,
						technologyId,
					})),
				);
			}
		}

		if (input.interestIds !== undefined) {
			await tx.delete(userInterest).where(eq(userInterest.userId, userId));

			if (input.interestIds.length > 0) {
				await tx.insert(userInterest).values(
					input.interestIds.map((interestId) => ({
						userId,
						interestId,
					})),
				);
			}
		}
	});

	return getProfileWithRelations(userId);
}
