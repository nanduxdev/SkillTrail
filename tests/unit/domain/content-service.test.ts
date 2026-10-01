import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── DB mock ──────────────────────────────────────────────────────────────────

// Queue of row arrays consumed in call order by mockSelect.
const selectQueue: unknown[][] = [];

function thenable(rows: unknown[]) {
	const builder: Record<string, unknown> = {};
	const self = () => builder;
	builder.from = self;
	builder.where = self;
	builder.limit = self;
	builder.innerJoin = self;
	builder.orderBy = self;
	builder.then = (
		onFulfilled?: (value: unknown) => unknown,
		onRejected?: (reason: unknown) => unknown,
	) => Promise.resolve(rows).then(onFulfilled, onRejected);
	return builder;
}

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/db", () => ({
	db: {
		select: mockSelect,
		insert: mockInsert,
		update: mockUpdate,
		delete: mockDelete,
		transaction: mockTransaction,
	},
}));

function queueSelect(...batches: unknown[][]) {
	selectQueue.splice(0, selectQueue.length, ...batches);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const CONTENT_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const MEDIA_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";
const RESEARCH_ID = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";

const contentRow = {
	id: CONTENT_ID,
	userId: USER_ID,
	rawText: "hello world",
	origin: "manual" as const,
	processingStatus: "raw" as const,
	understandingResult: null,
	researchId: null,
	discoveryItemId: null,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-01"),
};

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeInsertBuilder(returnRows: unknown[] = [contentRow]) {
	const builder: Record<string, unknown> = {};
	builder.values = () => builder;
	builder.returning = async () => returnRows;
	builder.set = () => builder;
	builder.where = () => builder;
	return builder;
}

function makeUpdateBuilder(returnRows: unknown[] = [contentRow]) {
	const builder: Record<string, unknown> = {};
	builder.set = () => builder;
	builder.where = () => builder;
	builder.returning = async () => returnRows;
	return builder;
}

function makeDeleteBuilder(returnRows: unknown[] = []) {
	const builder: Record<string, unknown> = {};
	builder.where = () => builder;
	builder.returning = async () => returnRows;
	builder.then = (
		onFulfilled?: (value: unknown) => unknown,
		onRejected?: (reason: unknown) => unknown,
	) => Promise.resolve(undefined).then(onFulfilled, onRejected);
	return builder;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("content-service — create", () => {
	beforeEach(() => {
		selectQueue.length = 0;
		mockSelect.mockReset();
		mockInsert.mockReset();
		mockUpdate.mockReset();
		mockDelete.mockReset();
		mockTransaction.mockReset();

		mockSelect.mockImplementation(() => thenable(selectQueue.shift() ?? []));
		mockInsert.mockImplementation(() => makeInsertBuilder());
		mockUpdate.mockImplementation(() => makeUpdateBuilder());
		mockDelete.mockImplementation(() => makeDeleteBuilder());
		mockTransaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
			fn({
				insert: mockInsert,
				update: mockUpdate,
				delete: mockDelete,
				select: mockSelect,
			}),
		);
	});

	it("creates content with no optional fields", async () => {
		const { create } = await import("@/lib/domain/content-service");
		// transaction wraps insert; no pre-checks needed
		const result = await create(USER_ID, { origin: "manual" });
		expect(mockTransaction).toHaveBeenCalled();
		expect(result.content.userId).toBe(USER_ID);
		expect(result.contextMedia).toEqual([]);
	});

	it("returns NOT_FOUND when researchId does not exist or belongs to another user", async () => {
		queueSelect([]); // research query returns nothing
		const { create } = await import("@/lib/domain/content-service");
		await expect(
			create(USER_ID, { origin: "manual", researchId: RESEARCH_ID }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(mockTransaction).not.toHaveBeenCalled();
	});

	it("returns NOT_FOUND when discoveryItemId does not exist or is archived", async () => {
		queueSelect([]); // discovery query returns nothing
		const { create } = await import("@/lib/domain/content-service");
		await expect(
			create(USER_ID, {
				origin: "manual",
				discoveryItemId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(mockTransaction).not.toHaveBeenCalled();
	});

	it("returns VALIDATION_ERROR for unknown or foreign mediaIds in contextMedia", async () => {
		queueSelect([]); // media ownership query returns nothing
		const { create } = await import("@/lib/domain/content-service");
		await expect(
			create(USER_ID, {
				origin: "manual",
				contextMedia: [{ mediaId: MEDIA_ID }],
			}),
		).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
		expect(mockTransaction).not.toHaveBeenCalled();
	});

	it("deduplicates mediaIds before inserting context_media rows", async () => {
		// Both mediaId entries are the same — media ownership check passes once
		queueSelect([{ id: MEDIA_ID, userId: USER_ID }]);
		const inserted: unknown[][] = [];
		mockInsert.mockImplementation(() => {
			const builder: Record<string, unknown> = {};
			builder.values = (rows: unknown) => {
				inserted.push(rows as unknown[]);
				return builder;
			};
			builder.returning = async () =>
				inserted.length === 1
					? [contentRow]
					: [
							{
								contentId: CONTENT_ID,
								mediaId: MEDIA_ID,
								note: null,
								createdAt: new Date(),
							},
						];
			return builder;
		});

		const { create } = await import("@/lib/domain/content-service");
		await create(USER_ID, {
			origin: "manual",
			contextMedia: [{ mediaId: MEDIA_ID }, { mediaId: MEDIA_ID }],
		});

		// context_media insert should receive exactly 1 unique entry
		const contextInsertValues = inserted[1];
		expect(
			Array.isArray(contextInsertValues) ? contextInsertValues.length : 1,
		).toBe(1);
	});
});

describe("content-service — update", () => {
	beforeEach(() => {
		selectQueue.length = 0;
		mockSelect.mockReset();
		mockUpdate.mockReset();
		mockSelect.mockImplementation(() => thenable(selectQueue.shift() ?? []));
		mockUpdate.mockImplementation(() => makeUpdateBuilder());
	});

	it("updates only the supplied fields", async () => {
		queueSelect([contentRow]); // requireOwned
		const { update } = await import("@/lib/domain/content-service");
		const result = await update(USER_ID, CONTENT_ID, { rawText: "updated" });
		expect(mockUpdate).toHaveBeenCalled();
		expect(result).toMatchObject({ id: CONTENT_ID });
	});

	it("returns NOT_FOUND when content does not belong to caller", async () => {
		// return a row with a different userId
		queueSelect([{ ...contentRow, userId: OTHER_USER_ID }]);
		const { update } = await import("@/lib/domain/content-service");
		await expect(
			update(USER_ID, CONTENT_ID, { rawText: "x" }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(mockUpdate).not.toHaveBeenCalled();
	});

	it("is a no-op when no fields are supplied, returns current row", async () => {
		queueSelect([contentRow], [contentRow]); // requireOwned + re-fetch
		const { update } = await import("@/lib/domain/content-service");
		const result = await update(USER_ID, CONTENT_ID, {});
		expect(mockUpdate).not.toHaveBeenCalled();
		expect(result.id).toBe(CONTENT_ID);
	});
});

describe("content-service — deleteContent", () => {
	beforeEach(() => {
		selectQueue.length = 0;
		mockSelect.mockReset();
		mockDelete.mockReset();
		mockSelect.mockImplementation(() => thenable(selectQueue.shift() ?? []));
		mockDelete.mockImplementation(() => makeDeleteBuilder());
	});

	it("deletes content and returns { deleted: true }", async () => {
		queueSelect([contentRow], []); // requireOwned, no live publications
		const { deleteContent } = await import("@/lib/domain/content-service");
		const result = await deleteContent(USER_ID, CONTENT_ID);
		expect(result).toEqual({ deleted: true });
		expect(mockDelete).toHaveBeenCalled();
	});

	it("returns NOT_FOUND when content does not belong to caller", async () => {
		queueSelect([{ ...contentRow, userId: OTHER_USER_ID }]);
		const { deleteContent } = await import("@/lib/domain/content-service");
		await expect(deleteContent(USER_ID, CONTENT_ID)).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(mockDelete).not.toHaveBeenCalled();
	});

	it("returns CONFLICT when a live publication exists in the composition tree", async () => {
		queueSelect([contentRow], [{ id: "pub-1" }]); // requireOwned, live publication found
		const { deleteContent } = await import("@/lib/domain/content-service");
		await expect(deleteContent(USER_ID, CONTENT_ID)).rejects.toMatchObject({
			code: "CONFLICT",
		});
		expect(mockDelete).not.toHaveBeenCalled();
	});
});

describe("content-service — addContextMedia", () => {
	beforeEach(() => {
		selectQueue.length = 0;
		mockSelect.mockReset();
		mockInsert.mockReset();
		mockSelect.mockImplementation(() => thenable(selectQueue.shift() ?? []));
		mockInsert.mockImplementation(() =>
			makeInsertBuilder([
				{
					contentId: CONTENT_ID,
					mediaId: MEDIA_ID,
					note: null,
					createdAt: new Date(),
				},
			]),
		);
	});

	it("inserts and returns the attachment row", async () => {
		queueSelect([contentRow], [{ id: MEDIA_ID, userId: USER_ID }], []); // content, media ownership, no existing
		const { addContextMedia } = await import("@/lib/domain/content-service");
		const result = await addContextMedia(USER_ID, CONTENT_ID, {
			mediaId: MEDIA_ID,
		});
		expect(result).toMatchObject({ contentId: CONTENT_ID, mediaId: MEDIA_ID });
	});

	it("returns NOT_FOUND when content is not owned by caller", async () => {
		queueSelect([{ ...contentRow, userId: OTHER_USER_ID }]);
		const { addContextMedia } = await import("@/lib/domain/content-service");
		await expect(
			addContextMedia(USER_ID, CONTENT_ID, { mediaId: MEDIA_ID }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("returns NOT_FOUND when media is not owned by caller", async () => {
		queueSelect([contentRow], [{ id: MEDIA_ID, userId: OTHER_USER_ID }]); // content ok, media foreign
		const { addContextMedia } = await import("@/lib/domain/content-service");
		await expect(
			addContextMedia(USER_ID, CONTENT_ID, { mediaId: MEDIA_ID }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("returns CONFLICT when the (contentId, mediaId) pair already exists", async () => {
		queueSelect(
			[contentRow],
			[{ id: MEDIA_ID, userId: USER_ID }],
			[{ contentId: CONTENT_ID }], // existing attachment found
		);
		const { addContextMedia } = await import("@/lib/domain/content-service");
		await expect(
			addContextMedia(USER_ID, CONTENT_ID, { mediaId: MEDIA_ID }),
		).rejects.toMatchObject({
			code: "CONFLICT",
		});
	});
});

describe("content-service — removeContextMedia", () => {
	beforeEach(() => {
		selectQueue.length = 0;
		mockSelect.mockReset();
		mockDelete.mockReset();
		mockSelect.mockImplementation(() => thenable(selectQueue.shift() ?? []));
	});

	it("deletes the attachment and returns { deleted: true }", async () => {
		queueSelect([contentRow]); // requireOwned
		mockDelete.mockImplementation(() =>
			makeDeleteBuilder([{ contentId: CONTENT_ID, mediaId: MEDIA_ID }]),
		);
		const { removeContextMedia } = await import("@/lib/domain/content-service");
		const result = await removeContextMedia(USER_ID, CONTENT_ID, MEDIA_ID);
		expect(result).toEqual({ deleted: true });
	});

	it("returns NOT_FOUND when content is not owned", async () => {
		queueSelect([{ ...contentRow, userId: OTHER_USER_ID }]);
		const { removeContextMedia } = await import("@/lib/domain/content-service");
		await expect(
			removeContextMedia(USER_ID, CONTENT_ID, MEDIA_ID),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("returns NOT_FOUND when the attachment does not exist", async () => {
		queueSelect([contentRow]); // requireOwned passes
		mockDelete.mockImplementation(() => makeDeleteBuilder([])); // no rows deleted
		const { removeContextMedia } = await import("@/lib/domain/content-service");
		await expect(
			removeContextMedia(USER_ID, CONTENT_ID, MEDIA_ID),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
