import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const earlyAccess = pgTable("early_access", {
	id: uuid("id").defaultRandom().primaryKey(),

	email: text("email").notNull().unique(),

	createdAt: timestamp("created_at", {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});
