import { db } from "../../db";
import { notificationPreference } from "../../db/schema/notification";

export async function enableMarketingEmails(userId: string): Promise<void> {
	await db
		.insert(notificationPreference)
		.values({
			userId,
			marketingEmailsEnabled: true,
		})
		.onConflictDoUpdate({
			target: notificationPreference.userId,
			set: {
				marketingEmailsEnabled: true,
			},
		});
}
