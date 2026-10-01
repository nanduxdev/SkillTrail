"use server";

import { authActionClient } from "@/lib/safe-action";
import { enableMarketingEmails } from "@/lib/domain/notification-preference";

export const setMarketingEmailPreference = authActionClient.action(
	async ({ ctx }) => {
		await enableMarketingEmails(ctx.auth.user.id);
		return { saved: true as const };
	},
);
