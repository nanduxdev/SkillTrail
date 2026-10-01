import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEmailExists = vi.fn();
const mockJoin = vi.fn();

vi.mock("@/db", () => ({
	db: {},
}));

vi.mock("@/lib/domain/early-access", () => ({
	emailExists: (...args: unknown[]) => mockEmailExists(...args),
	join: (...args: unknown[]) => mockJoin(...args),
}));

function setEnv() {
	process.env.BETTER_AUTH_URL = "http://localhost:3000";
	process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long";
	process.env.GOOGLE_WEB_CLIENT_ID = "google-client-id";
	process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
	process.env.DATABASE_URL = "postgres://localhost:5432/skilltrail_test";
}

describe("joinEarlyAccess", () => {
	beforeEach(() => {
		vi.resetModules();
		setEnv();
		mockEmailExists.mockReset();
		mockJoin.mockReset();
	});

	it("returns validationErrors for an invalid email", async () => {
		const { joinEarlyAccess } = await import("@/features/early-access/actions");
		const result = await joinEarlyAccess({ email: "not-an-email" });

		expect(result.data).toBeUndefined();
		expect(result.validationErrors?.fieldErrors?.email).toBeDefined();
	});

	it("returns a field error when the email is already registered", async () => {
		mockEmailExists.mockResolvedValue(true);
		const { joinEarlyAccess } = await import("@/features/early-access/actions");
		const result = await joinEarlyAccess({ email: "dev@example.com" });

		expect(result.data).toBeUndefined();
		expect(result.validationErrors?.fieldErrors?.email?.[0]).toBe(
			"This email is already on the list.",
		);
		expect(mockJoin).not.toHaveBeenCalled();
	});

	it("joins a new email", async () => {
		mockEmailExists.mockResolvedValue(false);
		mockJoin.mockResolvedValue(undefined);
		const { joinEarlyAccess } = await import("@/features/early-access/actions");
		const result = await joinEarlyAccess({ email: "dev@example.com" });

		expect(result.data).toEqual({ joined: true });
		expect(mockJoin).toHaveBeenCalledWith("dev@example.com");
	});
});
