"use server";

import { z } from "zod";
import { db } from "@/db";
import { earlyAccess, notificationPreference } from "@/db/schema";
import { auth } from "./auth";
import { headers } from "next/headers";

const schema = z.object({
	email: z.email(),
});

function isPostgresUniqueViolation(error: unknown): boolean {
	if (typeof error !== "object" || error === null) return false;
	const record = error as { code?: unknown; cause?: unknown };
	if (record.code === "23505") return true;
	if (
		typeof record.cause === "object" &&
		record.cause !== null &&
		(record.cause as { code?: unknown }).code === "23505"
	) {
		return true;
	}
	return false;
}

export async function postEarlyAccessAction(data: z.infer<typeof schema>) {
	try {
		const prarsedData = schema.parse(data);
		const result = await db.insert(earlyAccess).values(prarsedData);
		if (!result) {
			throw new Error("Error");
		}
		return {
			success: true,
		};
	} catch (error) {
		console.log(error);
		if (isPostgresUniqueViolation(error)) {
			return {
				success: false,
				error: "ALREADY_SUBSCRIBED",
			};
		}
		return {
			success: false,
			error: "Internal server error",
		};
	}
}

export async function setMarketingEmailPreferenceAction() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return {
				success: false,
				error: "Unauthorized",
			};
		}

		await db
			.insert(notificationPreference)
			.values({
				userId: session.user.id,
				marketingEmailsEnabled: true,
			})
			.onConflictDoUpdate({
				target: notificationPreference.userId,
				set: {
					marketingEmailsEnabled: true,
				},
			});

		return {
			success: true,
		};
	} catch {
		return {
			success: false,
			error: "Could not save email preferences.",
		};
	}
}
