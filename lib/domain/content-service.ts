import { and, eq, inArray, isNull, lt, notInArray } from "drizzle-orm";
import { db } from "../../db";
import { angle, content, contentContextMedia } from "../../db/schema/content";
import { discoveryItem } from "../../db/schema/discovery";
import { media } from "../../db/schema/media";
import { publication } from "../../db/schema/publication";
import { research } from "../../db/schema/research";
import { composition } from "../../db/schema/composition";
import { conflict, notFound, validationError } from "../errors";
import type {
	AddContextMediaInputType,
	CreateContentInputType,
	UpdateContentInputType,
} from "../schemas/content";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentRow = typeof content.$inferSelect;
export type AngleRow = typeof angle.$inferSelect;
export type ContextMediaRow = typeof contentContextMedia.$inferSelect;

export interface ContentDetail {
	content: ContentRow;
	contextMedia: ContextMediaRow[];
}

export interface ContentSummary {
	id: string;
	rawText: string | null;
	origin: "manual" | "research" | "discovery";
	processingStatus: "raw" | "analyzing" | "understood" | "failed";
	researchId: string | null;
	discoveryItemId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface ContentWithRelations {
	content: ContentRow;
	contextMedia: ContextMediaRow[];
	angles: AngleRow[];
	compositions: Array<{
		id: string;
		angleId: string | null;
		createdAt: Date;
		updatedAt: Date;
	}>;
}

export interface ContentListResult {
	items: ContentSummary[];
	nextCursor: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireOwned(
	userId: string,
	contentId: string,
): Promise<ContentRow> {
	const [row] = await db
		.select()
		.from(content)
		.where(eq(content.id, contentId))
		.limit(1);

	if (!row || row.userId !== userId) throw notFound("Content not found.");
	return row;
}

// ─── create ──────────────────────────────────────────────────────────────────

export async function create(
	userId: string,
	input: CreateContentInputType,
): Promise<ContentDetail> {
	// Validate researchId ownership (research has userId).
	if (input.researchId != null) {
		const [researchRow] = await db
			.select({ id: research.id })
			.from(research)
			.where(
				and(eq(research.id, input.researchId), eq(research.userId, userId)),
			)
			.limit(1);
		if (!researchRow) throw notFound("Research session not found.");
	}

	// Validate discoveryItemId existence + non-archived (global table, no userId).
	if (input.discoveryItemId != null) {
		const [discRow] = await db
			.select({ id: discoveryItem.id })
			.from(discoveryItem)
			.where(
				and(
					eq(discoveryItem.id, input.discoveryItemId),
					isNull(discoveryItem.archivedAt),
				),
			)
			.limit(1);
		if (!discRow) throw notFound("Discovery item not found or archived.");
	}

	// Deduplicate and validate contextMedia mediaIds.
	const rawMediaItems = input.contextMedia ?? [];
	const uniqueMediaItems = [
		...new Map(rawMediaItems.map((item) => [item.mediaId, item])).values(),
	];

	if (uniqueMediaItems.length > 0) {
		const mediaIds = uniqueMediaItems.map((m) => m.mediaId);
		const foundMedia = await db
			.select({ id: media.id, userId: media.userId })
			.from(media)
			.where(inArray(media.id, mediaIds));

		const foundMap = new Map(foundMedia.map((m) => [m.id, m]));
		const invalidIds = mediaIds.filter((id) => {
			const found = foundMap.get(id);
			return !found || found.userId !== userId;
		});

		if (invalidIds.length > 0) {
			throw validationError(
				"One or more media items not found or not owned by caller.",
				{
					contextMedia: invalidIds.map(
						(id) => `Unknown or inaccessible mediaId: ${id}`,
					),
				},
			);
		}
	}

	// Atomic insert: content + context_media rows.
	return db.transaction(async (tx) => {
		const [inserted] = await tx
			.insert(content)
			.values({
				userId,
				rawText: input.rawText ?? null,
				origin: input.origin,
				researchId: input.researchId ?? null,
				discoveryItemId: input.discoveryItemId ?? null,
			})
			.returning();

		let contextRows: ContextMediaRow[] = [];
		if (uniqueMediaItems.length > 0) {
			contextRows = await tx
				.insert(contentContextMedia)
				.values(
					uniqueMediaItems.map((item) => ({
						contentId: inserted.id,
						mediaId: item.mediaId,
						note: item.note ?? null,
					})),
				)
				.returning();
		}

		return { content: inserted, contextMedia: contextRows };
	});
}

// ─── update ──────────────────────────────────────────────────────────────────

export async function update(
	userId: string,
	contentId: string,
	input: UpdateContentInputType,
): Promise<ContentRow> {
	await requireOwned(userId, contentId);

	const patch: Partial<typeof content.$inferInsert> = {};
	if (input.rawText !== undefined) patch.rawText = input.rawText ?? null;
	if (input.origin !== undefined) patch.origin = input.origin;

	if (Object.keys(patch).length === 0) {
		// Nothing to update — return the current row.
		const [current] = await db
			.select()
			.from(content)
			.where(eq(content.id, contentId))
			.limit(1);
		return current;
	}

	const [updated] = await db
		.update(content)
		.set(patch)
		.where(eq(content.id, contentId))
		.returning();

	return updated;
}

// ─── delete ──────────────────────────────────────────────────────────────────

export async function deleteContent(
	userId: string,
	contentId: string,
): Promise<{ deleted: true }> {
	await requireOwned(userId, contentId);

	// Pre-query for live publications in this content's composition tree.
	// RESTRICT FK is the DB safety net; this pre-query gives us a clean CONFLICT.
	const [livePublication] = await db
		.select({ id: publication.id })
		.from(publication)
		.innerJoin(composition, eq(composition.id, publication.compositionId))
		.where(
			and(
				eq(composition.contentId, contentId),
				notInArray(publication.status, ["cancelled", "deleted"]),
			),
		)
		.limit(1);

	if (livePublication) {
		throw conflict(
			"Cannot delete content while a live publication exists in its composition tree.",
		);
	}

	await db.delete(content).where(eq(content.id, contentId));
	return { deleted: true };
}

// ─── addContextMedia ─────────────────────────────────────────────────────────

export async function addContextMedia(
	userId: string,
	contentId: string,
	input: AddContextMediaInputType,
): Promise<ContextMediaRow> {
	await requireOwned(userId, contentId);

	// Validate media ownership.
	const [mediaRow] = await db
		.select({ id: media.id, userId: media.userId })
		.from(media)
		.where(eq(media.id, input.mediaId))
		.limit(1);

	if (!mediaRow || mediaRow.userId !== userId) {
		throw notFound("Media not found.");
	}

	// Check for duplicate attachment.
	const [existing] = await db
		.select({ contentId: contentContextMedia.contentId })
		.from(contentContextMedia)
		.where(
			and(
				eq(contentContextMedia.contentId, contentId),
				eq(contentContextMedia.mediaId, input.mediaId),
			),
		)
		.limit(1);

	if (existing) {
		throw conflict("This media is already attached to the content.");
	}

	const [inserted] = await db
		.insert(contentContextMedia)
		.values({ contentId, mediaId: input.mediaId, note: input.note ?? null })
		.returning();

	return inserted;
}

// ─── removeContextMedia ──────────────────────────────────────────────────────

export async function removeContextMedia(
	userId: string,
	contentId: string,
	mediaId: string,
): Promise<{ deleted: true }> {
	await requireOwned(userId, contentId);

	const deleted = await db
		.delete(contentContextMedia)
		.where(
			and(
				eq(contentContextMedia.contentId, contentId),
				eq(contentContextMedia.mediaId, mediaId),
			),
		)
		.returning();

	if (deleted.length === 0) {
		throw notFound("Context media attachment not found.");
	}

	return { deleted: true };
}

// ─── getList (used by queries.ts) ────────────────────────────────────────────

export async function getList(
	userId: string,
	{ limit = 20, cursor }: { limit?: number; cursor?: string },
): Promise<ContentListResult> {
	const cap = Math.min(limit, 50);

	const rows = await db
		.select({
			id: content.id,
			rawText: content.rawText,
			origin: content.origin,
			processingStatus: content.processingStatus,
			researchId: content.researchId,
			discoveryItemId: content.discoveryItemId,
			createdAt: content.createdAt,
			updatedAt: content.updatedAt,
		})
		.from(content)
		.where(
			cursor
				? and(
						eq(content.userId, userId),
						lt(content.createdAt, new Date(cursor)),
					)
				: eq(content.userId, userId),
		)
		.orderBy(content.createdAt)
		.limit(cap + 1);

	const hasMore = rows.length > cap;
	const items = hasMore ? rows.slice(0, cap) : rows;
	const nextCursor = hasMore
		? items[items.length - 1].createdAt.toISOString()
		: null;

	return { items: items as ContentSummary[], nextCursor };
}

// ─── getOne (used by queries.ts) ─────────────────────────────────────────────

export async function getOne(
	userId: string,
	contentId: string,
): Promise<ContentWithRelations> {
	const contentRow = await requireOwned(userId, contentId);

	const [contextRows, angleRows, compositionRows] = await Promise.all([
		db
			.select()
			.from(contentContextMedia)
			.where(eq(contentContextMedia.contentId, contentId)),
		db.select().from(angle).where(eq(angle.contentId, contentId)),
		db
			.select({
				id: composition.id,
				angleId: composition.angleId,
				createdAt: composition.createdAt,
				updatedAt: composition.updatedAt,
			})
			.from(composition)
			.where(eq(composition.contentId, contentId)),
	]);

	return {
		content: contentRow,
		contextMedia: contextRows,
		angles: angleRows,
		compositions: compositionRows,
	};
}
