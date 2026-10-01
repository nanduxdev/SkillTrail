import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.fn();
const mockUpdateProfile = vi.fn();
const mockListTechnologies = vi.fn();
const mockListInterests = vi.fn();
const mockGetProfileWithRelations = vi.fn();

vi.mock("next/headers", () => ({
	headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/db", () => ({
	db: {},
}));

vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

vi.mock("@/lib/domain/profile", () => ({
	getProfileWithRelations: (...args: unknown[]) =>
		mockGetProfileWithRelations(...args),
	updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
	listTechnologies: (...args: unknown[]) => mockListTechnologies(...args),
	listInterests: (...args: unknown[]) => mockListInterests(...args),
}));

const defaultProfile = {
	userId: "user-123",
	experienceLevel: null,
	preferredPlatforms: [],
	writingTone: null,
	technicalDepth: null,
	emojiUsage: null,
	writingInstruction: null,
	technologies: [],
	interests: [],
};

function setEnv() {
	process.env.BETTER_AUTH_URL = "http://localhost:3000";
	process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long";
	process.env.GOOGLE_WEB_CLIENT_ID = "google-client-id";
	process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
	process.env.DATABASE_URL = "postgres://localhost:5432/skilltrail_test";
}

function mockSession(userId = "user-123") {
	mockGetSession.mockResolvedValue({
		session: { id: "sess-1" },
		user: { id: userId },
	});
}

describe("profile actions and queries", () => {
	beforeEach(() => {
		vi.resetModules();
		setEnv();
		mockGetSession.mockReset();
		mockUpdateProfile.mockReset();
		mockListTechnologies.mockReset();
		mockListInterests.mockReset();
		mockGetProfileWithRelations.mockReset();
	});

	it("updateProfile returns UNAUTHENTICATED when there is no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({});

		expect(result.data).toBeUndefined();
		expect(result.serverError?.code).toBe("UNAUTHENTICATED");
	});

	it("updateProfile returns field validation errors for invalid enums", async () => {
		mockSession();
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({
			experienceLevel: "wizard",
		} as never);

		expect(result.data).toBeUndefined();
		expect(result.validationErrors?.fieldErrors?.experienceLevel).toBeDefined();
	});

	it("updateProfile returns field validation errors for invalid platforms", async () => {
		mockSession();
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({
			preferredPlatforms: ["twitter"],
		} as never);

		expect(
			result.validationErrors?.fieldErrors?.preferredPlatforms,
		).toBeDefined();
	});

	it("updateProfile returns field validation errors for writingInstruction over 1000 chars", async () => {
		mockSession();
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({
			writingInstruction: "x".repeat(1001),
		});

		expect(
			result.validationErrors?.fieldErrors?.writingInstruction,
		).toBeDefined();
	});

	it("updateProfile returns field validation errors for non-UUID technologyIds", async () => {
		mockSession();
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({ technologyIds: ["not-a-uuid"] });

		expect(result.validationErrors?.fieldErrors?.technologyIds).toBeDefined();
	});

	it("updateProfile treats {} as a valid no-op", async () => {
		mockSession();
		mockUpdateProfile.mockResolvedValue(defaultProfile);
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({});

		expect(result.serverError).toBeUndefined();
		expect(result.validationErrors).toBeUndefined();
		expect(result.data).toMatchObject({ userId: "user-123" });
		expect(mockUpdateProfile).toHaveBeenCalledWith("user-123", {});
	});

	it("maps unknown catalog IDs to validationErrors", async () => {
		mockSession();
		const { validationError } = await import("@/lib/errors");
		mockUpdateProfile.mockRejectedValue(
			validationError("Invalid technology IDs", {
				technologyIds: ["Unknown ID: 00000000-0000-0000-0000-000000000001"],
			}),
		);
		const { updateProfile } = await import("@/features/profile/actions");
		const result = await updateProfile({
			technologyIds: ["00000000-0000-0000-0000-000000000001"],
		});

		expect(result.data).toBeUndefined();
		expect(result.serverError).toBeUndefined();
		expect(result.validationErrors?.fieldErrors?.technologyIds).toBeDefined();
	});

	it("searchTechnologies returns 401-equivalent without a session", async () => {
		mockGetSession.mockResolvedValue(null);
		const { searchTechnologies } = await import("@/features/profile/actions");
		const result = await searchTechnologies({});
		expect(result.serverError?.code).toBe("UNAUTHENTICATED");
	});

	it("searchTechnologies returns catalog items", async () => {
		mockSession();
		mockListTechnologies.mockResolvedValue([
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
		]);
		const { searchTechnologies } = await import("@/features/profile/actions");
		const result = await searchTechnologies({});

		expect(result.data?.items).toEqual([
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
		]);
		expect(mockListTechnologies).toHaveBeenCalledWith(undefined);
	});

	it("searchInterests returns catalog items", async () => {
		mockSession();
		mockListInterests.mockResolvedValue([
			{ id: "1", name: "AI & Machine Learning" },
			{ id: "2", name: "Open Source" },
		]);
		const { searchInterests } = await import("@/features/profile/actions");
		const result = await searchInterests({});

		expect(result.data?.items).toEqual([
			{ id: "1", name: "AI & Machine Learning" },
			{ id: "2", name: "Open Source" },
		]);
	});

	it("getProfile delegates to the domain service", async () => {
		mockGetProfileWithRelations.mockResolvedValue(defaultProfile);
		const { getProfile } = await import("@/features/profile/queries");
		const profile = await getProfile("user-123");

		expect(profile).toMatchObject({ userId: "user-123", technologies: [] });
		expect(mockGetProfileWithRelations).toHaveBeenCalledWith("user-123");
	});
});
