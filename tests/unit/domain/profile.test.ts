import { beforeEach, describe, expect, it, vi } from "vitest";
import { validationError } from "@/lib/errors";

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
const mockDelete = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/db", () => ({
	db: {
		select: mockSelect,
		insert: mockInsert,
		delete: mockDelete,
		transaction: mockTransaction,
	},
}));

const defaultRow = {
	userId: "user-123",
	experienceLevel: null,
	preferredPlatforms: [],
	writingTone: null,
	technicalDepth: null,
	emojiUsage: null,
	writingInstruction: null,
};

function queueSelect(...batches: unknown[][]) {
	selectQueue.splice(0, selectQueue.length, ...batches);
}

describe("profile domain", () => {
	beforeEach(() => {
		selectQueue.length = 0;
		mockSelect.mockReset();
		mockInsert.mockReset();
		mockDelete.mockReset();
		mockTransaction.mockReset();

		mockSelect.mockImplementation(() => thenable(selectQueue.shift() ?? []));
		mockInsert.mockImplementation(() => {
			const builder: Record<string, unknown> = {};
			builder.values = () => builder;
			builder.returning = async () => [{ ...defaultRow }];
			builder.onConflictDoUpdate = async () => [];
			return builder;
		});
		mockDelete.mockImplementation(() => thenable([]));
		mockTransaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
			fn({
				insert: mockInsert,
				delete: mockDelete,
			}),
		);
	});

	it("auto-creates a profile row when none exists", async () => {
		queueSelect([], [], []);
		const { getProfileWithRelations } = await import("@/lib/domain/profile");
		const profile = await getProfileWithRelations("user-123");

		expect(profile).toMatchObject({
			userId: "user-123",
			technologies: [],
			interests: [],
		});
		expect(mockInsert).toHaveBeenCalled();
	});

	it("returns an existing profile with selected technologies and interests", async () => {
		queueSelect(
			[{ ...defaultRow, writingTone: "casual" }],
			[{ id: "t1", name: "React" }],
			[{ id: "i1", name: "Open Source" }],
		);
		const { getProfileWithRelations } = await import("@/lib/domain/profile");
		const profile = await getProfileWithRelations("user-123");

		expect(profile.writingTone).toBe("casual");
		expect(profile.technologies).toEqual([{ id: "t1", name: "React" }]);
		expect(profile.interests).toEqual([{ id: "i1", name: "Open Source" }]);
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("rejects unknown technology IDs before writing", async () => {
		queueSelect([]);
		const { updateProfile } = await import("@/lib/domain/profile");

		await expect(
			updateProfile("user-123", {
				technologyIds: ["00000000-0000-0000-0000-000000000001"],
			}),
		).rejects.toMatchObject({
			code: "VALIDATION_ERROR",
			fieldErrors: {
				technologyIds: ["Unknown ID: 00000000-0000-0000-0000-000000000001"],
			},
		});
		expect(mockTransaction).not.toHaveBeenCalled();
		expect(validationError).toBeTypeOf("function");
	});

	it("rejects unknown interest IDs before writing", async () => {
		queueSelect([]);
		const { updateProfile } = await import("@/lib/domain/profile");

		await expect(
			updateProfile("user-123", {
				interestIds: ["00000000-0000-0000-0000-000000000002"],
			}),
		).rejects.toMatchObject({
			code: "VALIDATION_ERROR",
			fieldErrors: {
				interestIds: ["Unknown ID: 00000000-0000-0000-0000-000000000002"],
			},
		});
		expect(mockTransaction).not.toHaveBeenCalled();
	});

	it("replaces technology selections when IDs are valid", async () => {
		const techId = "11111111-1111-1111-1111-111111111111";
		queueSelect(
			[{ id: techId }],
			[{ ...defaultRow }],
			[{ id: techId, name: "React" }],
			[],
		);
		const { updateProfile } = await import("@/lib/domain/profile");
		const profile = await updateProfile("user-123", {
			technologyIds: [techId],
		});

		expect(mockTransaction).toHaveBeenCalled();
		expect(mockDelete).toHaveBeenCalled();
		expect(profile.technologies).toEqual([{ id: techId, name: "React" }]);
	});

	it("removes all technology selections when given an empty array", async () => {
		queueSelect([{ ...defaultRow }], [], []);
		const { updateProfile } = await import("@/lib/domain/profile");
		const profile = await updateProfile("user-123", { technologyIds: [] });

		expect(mockTransaction).toHaveBeenCalled();
		expect(profile.technologies).toEqual([]);
	});

	it("only upserts provided preference fields", async () => {
		const inserted: unknown[] = [];
		mockInsert.mockImplementation(() => {
			const builder: Record<string, unknown> = {};
			builder.values = (value: unknown) => {
				inserted.push(value);
				return builder;
			};
			builder.returning = async () => [{ ...defaultRow }];
			builder.onConflictDoUpdate = async () => [];
			return builder;
		});
		queueSelect([{ ...defaultRow, emojiUsage: "minimal" }], [], []);
		const { updateProfile } = await import("@/lib/domain/profile");
		await updateProfile("user-123", { writingTone: "casual" });

		expect(inserted[0]).toEqual({ userId: "user-123", writingTone: "casual" });
	});

	it("treats {} as a no-op upsert", async () => {
		queueSelect([{ ...defaultRow }], [], []);
		const { updateProfile } = await import("@/lib/domain/profile");
		const profile = await updateProfile("user-123", {});

		expect(mockTransaction).toHaveBeenCalled();
		expect(profile.userId).toBe("user-123");
	});

	it("lists technologies alphabetically and filters by query", async () => {
		queueSelect([
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
		]);
		const { listTechnologies } = await import("@/lib/domain/profile");
		const all = await listTechnologies();
		expect(all).toEqual([
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
		]);

		queueSelect([
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
		]);
		const filtered = await listTechnologies("script");
		expect(filtered).toEqual([{ id: "2", name: "TypeScript" }]);
	});

	it("lists interests alphabetically", async () => {
		queueSelect([
			{ id: "1", name: "AI & Machine Learning" },
			{ id: "2", name: "Open Source" },
		]);
		const { listInterests } = await import("@/lib/domain/profile");
		const items = await listInterests();
		expect(items).toEqual([
			{ id: "1", name: "AI & Machine Learning" },
			{ id: "2", name: "Open Source" },
		]);
	});
});
