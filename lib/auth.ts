import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { db } from "@/db"; // your drizzle instance
import * as authSchema from "@/db/schema/auth-schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
		schema: authSchema,
	}),
	advanced: {
		database: {
			joins: true,
			generateId: "uuid",
		},
	},
});
