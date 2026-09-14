import { sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { composition, draft } from "./composition";
import {
	platformEnum,
	publicationFailureReasonEnum,
	publicationStatusEnum,
} from "./enums";
import { socialConnection } from "./social";

// External publishing lifecycle/history — deliberately separate from Draft
// (Schema Spec §2.9). userId is denormalized here (justified per §3 —
// dashboard's primary queries are (user_id, status) and (scheduled_for)).
export const publication = pgTable(
	"publication",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		// RESTRICT — this is the enforcement point that blocks Content deletion
		// while a live publication exists anywhere in its composition tree.
		compositionId: uuid("composition_id")
			.notNull()
			.references(() => composition.id, { onDelete: "restrict" }),
		// Traceability only ("created from this draft") — never the source of
		// truth for what was actually published; that's `snapshot` below.
		draftId: uuid("draft_id").references(() => draft.id, {
			onDelete: "set null",
		}),

		platform: platformEnum("platform").notNull(),
		socialConnectionId: uuid("social_connection_id").references(
			() => socialConnection.id,
			{ onDelete: "set null" },
		),

		status: publicationStatusEnum("status").notNull().default("scheduled"),
		scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
		publishedAt: timestamp("published_at", { withTimezone: true }),

		// Immutable, hybrid snapshot: text, media refs + order, X thread
		// structure, reply/quote targets, platform-specific settings. JSONB is a
		// deliberate exception to "no polymorphic FKs" — it's an opaque frozen
		// payload, never joined against. See Schema Spec §2.9.
		snapshot: jsonb("snapshot").notNull(),

		externalPostId: text("external_post_id"),
		externalPostUrl: text("external_post_url"),
		triggerTaskId: text("trigger_task_id"),
		attemptCount: integer("attempt_count").notNull().default(0),
		lastError: text("last_error"),
		failureReason: publicationFailureReasonEnum("failure_reason"),

		cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),

		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		index("publication_user_status_idx").on(t.userId, t.status),
		index("publication_scheduled_idx")
			.on(t.scheduledFor)
			.where(sql`${t.status} = 'scheduled'`),
		index("publication_composition_idx").on(t.compositionId),
	],
);
