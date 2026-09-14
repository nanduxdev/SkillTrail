// app/actions.ts
"use server";

import { z } from "zod";
import { db } from "@/db";
import { earlyAccess } from "@/db/schema";

const schema = z.object({
	email: z.email(),
});

export async function postEarlyAccess(data: z.infer<typeof schema>) {
	try {
		const ressult = await db.insert(earlyAccess).values(data);
		if (!ressult) {
			throw new Error("Error");
		}
		return {
			success: true,
		};
	} catch (error) {
		console.log(error);
		const err = error as any;
		if (err?.code === "23505" || err?.cause?.code === "23505") {
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
