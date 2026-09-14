import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { researchStatusEnum } from "./enums";

export const research = pgTable(
	"research",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		query: text("query").notNull(),
		status: researchStatusEnum("status").notNull().default("running"),
		synthesis: text("synthesis"),
		// Populated only when research runs through Trigger.dev (long-running /
		// multi-source / retry-prone). Null for fast synchronous research.
		triggerTaskId: text("trigger_task_id"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		completedAt: timestamp("completed_at", { withTimezone: true }),
	},
	(t) => [index("research_user_idx").on(t.userId)],
);

export const researchSource = pgTable("research_source", {
	id: uuid("id").defaultRandom().primaryKey(),
	researchId: uuid("research_id")
		.notNull()
		.references(() => research.id, { onDelete: "cascade" }),
	url: text("url"),
	title: text("title"),
	snippet: text("snippet"),
	fetchedAt: timestamp("fetched_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
