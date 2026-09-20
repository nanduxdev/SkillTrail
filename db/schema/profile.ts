import { sql } from "drizzle-orm";
import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import {
	emojiUsageEnum,
	experienceLevelEnum,
	platformEnum,
	technicalDepthEnum,
	writingToneEnum,
} from "./enums";

// 1:1 with `user`. name/username live on Better Auth's `user` row (username
// plugin) — not duplicated here. See Schema Spec §2.2.
export const applicationProfile = pgTable("application_profile", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	experienceLevel: experienceLevelEnum("experience_level"),
	// Small fixed domain (2 values in V1) — plain enum array, not normalized.
	preferredPlatforms: platformEnum("preferred_platforms")
		.array()
		.notNull()
		.default(sql`'{}'::platform[]`),
	writingTone: writingToneEnum("writing_tone"),
	technicalDepth: technicalDepthEnum("technical_depth"),
	emojiUsage: emojiUsageEnum("emoji_usage"),
	writingInstruction: varchar("writing_instruction", { length: 1000 }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// Pre-seeded global technologies. Users search and select from this table.
export const technology = pgTable(
	"technology",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [uniqueIndex("technology_name_lower_idx").on(sql`lower(${t.name})`)],
);

export const userTechnology = pgTable(
	"user_technology",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		technologyId: uuid("technology_id")
			.notNull()
			.references(() => technology.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.userId, t.technologyId] })],
);

// Pre-seeded global interests. Kept as a separate table from technology
// because they are surfaced separately in the UI with different suggestion sets.
export const interest = pgTable(
	"interest",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [uniqueIndex("interest_name_lower_idx").on(sql`lower(${t.name})`)],
);

export const userInterest = pgTable(
	"user_interest",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		interestId: uuid("interest_id")
			.notNull()
			.references(() => interest.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.userId, t.interestId] })],
);
