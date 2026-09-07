import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";

// Node runtime (not Bun) per the project's runtime decision — Prisma/Drizzle,
// Playwright, Sharp, BullMQ, and the MCP TypeScript SDK are all built/tested
// primarily against Node.
export const db = drizzle(process.env.DATABASE_URL!, { relations });

export type Database = typeof db;
