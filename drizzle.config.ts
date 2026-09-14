import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });
// Column/table names are explicit snake_case strings throughout db/schema/*,
// so no `casing` option is needed here — what you see in the TS is exactly
// what lands in Postgres.
export default defineConfig({
	dialect: "postgresql",
	schema: "./db/schema/index.ts",
	out: "./db/migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	strict: true,
	verbose: true,
});
