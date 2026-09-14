import { drizzle } from "drizzle-orm/postgres-js";
import { appRelations } from "./relations";
import { authRelations } from "./schema/auth-schema";

// Node runtime (not Bun) per the project's runtime decision — Prisma/Drizzle,
// Playwright, Sharp, BullMQ, and the MCP TypeScript SDK are all built/tested
// primarily against Node.
export const db = drizzle(process.env.DATABASE_URL!, {
	relations: { ...appRelations, ...authRelations },
});
try {
    const result = await db.execute("select 1");
    
    console.log("result from db.execute in db.ts",result)
} catch (error) {
    console.log(error)
}
export type Database = typeof db;
