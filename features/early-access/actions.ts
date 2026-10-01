"use server";

import { z } from "zod";
import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "@/lib/safe-action";
import { emailExists, join } from "@/lib/domain/early-access";

export const joinEarlyAccessInput = z.object({
	email: z.string().email(),
});

export const joinEarlyAccess = actionClient
	.inputSchema(joinEarlyAccessInput)
	.action(async ({ parsedInput: { email } }) => {
		const exists = await emailExists(email);
		if (exists) {
			returnValidationErrors(joinEarlyAccessInput, {
				email: { _errors: ["This email is already on the list."] },
			});
		}

		try {
			await join(email);
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "EARLY_ACCESS_ALREADY_REGISTERED"
			) {
				returnValidationErrors(joinEarlyAccessInput, {
					email: { _errors: ["This email is already on the list."] },
				});
			}
			throw error;
		}

		return { joined: true as const };
	});
