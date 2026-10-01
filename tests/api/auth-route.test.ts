import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
const toNextJsHandler = vi.fn(() => ({ GET: mockGet, POST: mockPost }));

vi.mock("@/db", () => ({
	db: {},
}));

vi.mock("better-auth/next-js", async (importOriginal) => {
	const actual = await importOriginal<typeof import("better-auth/next-js")>();
	return {
		...actual,
		toNextJsHandler,
	};
});

function setAuthEnv() {
	process.env.BETTER_AUTH_URL = "http://localhost:3000";
	process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long";
	process.env.GOOGLE_WEB_CLIENT_ID = "google-client-id";
	process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
	process.env.DATABASE_URL = "postgres://localhost:5432/skilltrail_test";
}

describe("app/api/v1/auth/[...all]/route", () => {
	beforeEach(() => {
		vi.resetModules();
		toNextJsHandler.mockClear();
		mockGet.mockClear();
		mockPost.mockClear();
		setAuthEnv();
	});

	it("wires Better Auth to Next.js GET and POST handlers", async () => {
		const { auth } = await import("@/lib/auth");
		const route = await import("@/app/api/v1/auth/[...all]/route");

		expect(toNextJsHandler).toHaveBeenCalledOnce();
		expect(toNextJsHandler).toHaveBeenCalledWith(auth);
		expect(route.GET).toBe(mockGet);
		expect(route.POST).toBe(mockPost);
	});
});

describe("lib/auth", () => {
	beforeEach(() => {
		vi.resetModules();
		setAuthEnv();
	});

	it("exposes the SkillTrail auth API under /api/v1/auth", async () => {
		const { auth } = await import("@/lib/auth");

		expect(auth).toBeDefined();
		expect(auth.api).toBeDefined();
		expect(auth.handler).toBeTypeOf("function");
	});
});
