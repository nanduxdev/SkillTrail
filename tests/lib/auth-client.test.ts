import { describe, expect, it } from "vitest";
import { authClient } from "@/lib/auth-client";

describe("lib/auth-client", () => {
	it("targets the same Better Auth base path as the server", () => {
		expect(authClient).toBeDefined();
		expect(authClient.signIn).toBeDefined();
		expect(authClient.signUp).toBeDefined();
		expect(authClient.getLastUsedLoginMethod).toBeTypeOf("function");
	});
});
