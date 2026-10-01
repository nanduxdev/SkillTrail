import { createSafeActionClient } from "next-safe-action";
import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { auth } from "@/lib/auth";
import { AppError, type AppErrorCode } from "@/lib/errors";

export type AppServerError = {
	code: AppErrorCode;
	message: string;
	details?: unknown;
};

export const actionClient = createSafeActionClient({
	defaultValidationErrorsShape: "flattened",
	handleServerError(e): AppServerError {
		if (e instanceof AppError) {
			return { code: e.code, message: e.message, details: e.details };
		}
		console.error("Unhandled Server Action error:", e);
		return { code: "INTERNAL_ERROR", message: "Something went wrong." };
	},
});

export const authActionClient = actionClient.use(
	betterAuth(auth, {
		authorize: ({ authData, next }) => {
			if (!authData) {
				throw new AppError("UNAUTHENTICATED", "Sign in required.");
			}
			return next({ ctx: { auth: authData } });
		},
	}),
);
