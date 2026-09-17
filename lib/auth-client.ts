import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	basePath: "/api/v1/auth",
	plugins: [lastLoginMethodClient()],
});
