"use server";

import { returnValidationErrors } from "next-safe-action";
import { authActionClient } from "@/lib/safe-action";
import { AppError } from "@/lib/errors";
import { catalogSearchInput, UpdateProfileInput } from "@/lib/schemas/profile";
import {
	listInterests,
	listTechnologies,
	updateProfile as updateProfileForUser,
} from "@/lib/domain/profile";

function collectMessages(value: unknown): string[] {
	if (!value || typeof value !== "object") return [];
	const rec = value as Record<string, unknown>;
	const own = Array.isArray(rec._errors)
		? rec._errors.filter(
				(message): message is string => typeof message === "string",
			)
		: [];
	const nested = Object.entries(rec)
		.filter(([key]) => key !== "_errors")
		.flatMap(([, child]) => collectMessages(child));
	return [...own, ...nested];
}

function flattenIncludingArrayFields(ve: Record<string, unknown>) {
	const formErrors = Array.isArray(ve._errors)
		? ve._errors.filter(
				(message): message is string => typeof message === "string",
			)
		: [];
	const fieldErrors: Record<string, string[]> = {};

	for (const [key, value] of Object.entries(ve)) {
		if (key === "_errors") continue;
		const messages = collectMessages(value);
		if (messages.length > 0) fieldErrors[key] = messages;
	}

	return { formErrors, fieldErrors };
}

export const updateProfile = authActionClient
	.inputSchema(UpdateProfileInput, {
		handleValidationErrorsShape: async (ve) =>
			flattenIncludingArrayFields(ve as Record<string, unknown>),
	})
	.action(async ({ parsedInput, ctx }) => {
		try {
			return await updateProfileForUser(ctx.auth.user.id, parsedInput);
		} catch (e) {
			if (e instanceof AppError && e.fieldErrors) {
				returnValidationErrors(
					UpdateProfileInput,
					Object.fromEntries(
						Object.entries(e.fieldErrors).map(([key, messages]) => [
							key,
							{ _errors: messages },
						]),
					),
				);
			}
			throw e;
		}
	});

export const searchTechnologies = authActionClient
	.inputSchema(catalogSearchInput)
	.action(async ({ parsedInput }) => {
		const items = await listTechnologies(parsedInput.query);
		return { items };
	});

export const searchInterests = authActionClient
	.inputSchema(catalogSearchInput)
	.action(async ({ parsedInput }) => {
		const items = await listInterests(parsedInput.query);
		return { items };
	});
