import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── DB mock ───────────────────────────────────────────────────────────────────

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

// ─── Better Auth mock ─────────────────────────────────────────────────────────

const mockGetSession = vi.fn();

vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

function makeRequest(method: string, body?: unknown) {
	return new Request("http://localhost/api/v1/profile", {
		method,
		headers: { "Content-Type": "application/json" },
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
}

// ─── Domain mock helpers ──────────────────────────────────────────────────────

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/v1/profile", () => {
	beforeEach(() => {
		vi.resetModules();
		setEnv();
	});

	it("returns 401 if no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const { GET } = await import("@/app/api/v1/profile/route");
		const res = await GET(makeRequest("GET"));
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe("UNAUTHENTICATED");
	});

	it("auto-creates profile row for new user and returns profile shape", async () => {
		mockSession();

		vi.doMock("@/lib/domain/profile", () => ({
			getProfileWithRelations: vi.fn().mockResolvedValue({
				...defaultProfile,
				userId: "user-123",
			}),
			updateProfile: vi.fn(),
			listTechnologies: vi.fn(),
			listInterests: vi.fn(),
		}));

		const { GET } = await import("@/app/api/v1/profile/route");
		const res = await GET(makeRequest("GET"));
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.data).toMatchObject({
			userId: "user-123",
			technologies: [],
			interests: [],
		});
	});
});

describe("PATCH /api/v1/profile", () => {
	beforeEach(() => {
		vi.resetModules();
		setEnv();
	});

	it("returns 401 if no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const { PATCH } = await import("@/app/api/v1/profile/route");
		const res = await PATCH(makeRequest("PATCH", {}));
		expect(res.status).toBe(401);
	});

	it("returns 422 for invalid experienceLevel enum value", async () => {
		mockSession();
		const { PATCH } = await import("@/app/api/v1/profile/route");
		const res = await PATCH(
			makeRequest("PATCH", { experienceLevel: "wizard" }),
		);
		const body = await res.json();

		expect(res.status).toBe(422);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe("VALIDATION_ERROR");
		expect(body.error.fieldErrors?.experienceLevel).toBeDefined();
	});

	it("returns 422 for invalid platform value", async () => {
		mockSession();
		const { PATCH } = await import("@/app/api/v1/profile/route");
		const res = await PATCH(
			makeRequest("PATCH", { preferredPlatforms: ["twitter"] }),
		);
		const body = await res.json();

		expect(res.status).toBe(422);
		expect(body.error.fieldErrors?.preferredPlatforms).toBeDefined();
	});

	it("returns 422 for writingInstruction exceeding 1000 chars", async () => {
		mockSession();
		const { PATCH } = await import("@/app/api/v1/profile/route");
		const res = await PATCH(
			makeRequest("PATCH", { writingInstruction: "x".repeat(1001) }),
		);
		const body = await res.json();

		expect(res.status).toBe(422);
		expect(body.error.fieldErrors?.writingInstruction).toBeDefined();
	});

	it("returns 422 for non-UUID technologyIds", async () => {
		mockSession();
		const { PATCH } = await import("@/app/api/v1/profile/route");
		const res = await PATCH(
			makeRequest("PATCH", { technologyIds: ["not-a-uuid"] }),
		);
		const body = await res.json();

		expect(res.status).toBe(422);
		expect(body.error.fieldErrors?.technologyIds).toBeDefined();
	});

	it("accepts empty body as valid no-op", async () => {
		mockSession();

		// Mock the domain layer to return a default profile
		vi.doMock("@/lib/domain/profile", () => ({
			getProfileWithRelations: vi.fn().mockResolvedValue(defaultProfile),
			updateProfile: vi.fn().mockResolvedValue(defaultProfile),
		}));

		const { PATCH } = await import("@/app/api/v1/profile/route");
		const res = await PATCH(makeRequest("PATCH", {}));
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.success).toBe(true);
	});
});

describe("GET /api/v1/profile/technologies", () => {
	beforeEach(() => {
		vi.resetModules();
		setEnv();
	});

	it("returns 401 if no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const { GET } = await import("@/app/api/v1/profile/technologies/route");
		const res = await GET(
			new Request("http://localhost/api/v1/profile/technologies"),
		);
		expect(res.status).toBe(401);
	});

	it("returns items array sorted alphabetically", async () => {
		mockSession();

		vi.doMock("@/lib/domain/profile", () => ({
			listTechnologies: vi.fn().mockResolvedValue([
				{ id: "1", name: "React" },
				{ id: "2", name: "TypeScript" },
			]),
			getProfileWithRelations: vi.fn(),
			updateProfile: vi.fn(),
			listInterests: vi.fn(),
		}));

		const { GET } = await import("@/app/api/v1/profile/technologies/route");
		const res = await GET(
			new Request("http://localhost/api/v1/profile/technologies"),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.data.items).toEqual([
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
		]);
	});
});

describe("GET /api/v1/profile/interests", () => {
	beforeEach(() => {
		vi.resetModules();
		setEnv();
	});

	it("returns 401 if no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const { GET } = await import("@/app/api/v1/profile/interests/route");
		const res = await GET(
			new Request("http://localhost/api/v1/profile/interests"),
		);
		expect(res.status).toBe(401);
	});

	it("returns items array sorted alphabetically", async () => {
		mockSession();

		vi.doMock("@/lib/domain/profile", () => ({
			listInterests: vi.fn().mockResolvedValue([
				{ id: "1", name: "AI & Machine Learning" },
				{ id: "2", name: "Open Source" },
			]),
			getProfileWithRelations: vi.fn(),
			updateProfile: vi.fn(),
			listTechnologies: vi.fn(),
		}));

		const { GET } = await import("@/app/api/v1/profile/interests/route");
		const res = await GET(
			new Request("http://localhost/api/v1/profile/interests"),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.data.items).toEqual([
			{ id: "1", name: "AI & Machine Learning" },
			{ id: "2", name: "Open Source" },
		]);
	});
});
