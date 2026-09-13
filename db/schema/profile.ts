import {
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
  writingInstruction: text("writing_instruction"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Suggested + custom technologies share one table (Schema Spec §2.2).
// A custom entry a user types becomes a de-duplicated, globally visible
// suggestion for everyone afterward — see the [ASSUMPTION] flag in the spec.
export const technology = pgTable(
  "technology",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    isCustom: boolean("is_custom").notNull().default(false),
    createdByUserId: uuid("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
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

// Mirrors `technology` exactly — kept as a separate table rather than a
// shared "tag" table with a `kind` column because technologies and interests
// are surfaced in different onboarding steps with different suggestion
// sources; collapsing them would just move a discriminator column back in.
export const interest = pgTable(
  "interest",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    isCustom: boolean("is_custom").notNull().default(false),
    createdByUserId: uuid("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
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
