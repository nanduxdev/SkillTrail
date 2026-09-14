import {
	type AnyPgColumn,
	pgTable,
	smallint,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { draft } from "./composition";
import { socialConnection } from "./social";

// One row per thread item — only present when draft.xPostType = 'thread'.
// Schema Spec §2.7.
export const xThreadPost = pgTable(
	"x_thread_post",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		draftId: uuid("draft_id")
			.notNull()
			.references((): AnyPgColumn => draft.id, { onDelete: "cascade" }),
		position: smallint("position").notNull(),
		bodyText: text("body_text").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [uniqueIndex("x_thread_post_position_idx").on(t.draftId, t.position)],
);

// Lightweight cache of an external X post fetched via the reply/quote/thread
// -continuation picker. NOT a Publication — this may be a post made outside
// SkillTrail entirely. Schema Spec §2.7.
export const xExternalPost = pgTable(
	"x_external_post",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		socialConnectionId: uuid("social_connection_id")
			.notNull()
			.references(() => socialConnection.id, { onDelete: "cascade" }),
		platformPostId: text("platform_post_id").notNull(),
		authorHandle: text("author_handle"),
		textSnippet: text("text_snippet"),
		postedAt: timestamp("posted_at", { withTimezone: true }),
		fetchedAt: timestamp("fetched_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		uniqueIndex("x_external_post_identity_idx").on(
			t.socialConnectionId,
			t.platformPostId,
		),
	],
);
