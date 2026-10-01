import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { db } from "@/db"; // your drizzle instance
import { lastLoginMethod } from "better-auth/plugins";
import * as authSchema from "@/db/schema/auth-schema";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	basePath: "/api/v1/auth",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_WEB_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [lastLoginMethod(), username(), nextCookies()],
	advanced: {
		database: {
			joins: true,
			generateId: "uuid",
		},
	},
});
