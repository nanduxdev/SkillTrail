import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { notificationEmailStatusEnum, notificationTypeEnum } from "./enums";

export const notification = pgTable(
	"notification",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: notificationTypeEnum("type").notNull(),
		title: text("title").notNull(),
		body: text("body").notNull(),
		readAt: timestamp("read_at", { withTimezone: true }),
		// No separate email_delivery table for V1 — two columns cover the
		// fire-and-forget side channel at current volume. Schema Spec §2.13.
		emailStatus: notificationEmailStatusEnum("email_status")
			.notNull()
			.default("not_applicable"),
		emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [index("notification_user_read_idx").on(t.userId, t.readAt)],
);

export const notificationPreference = pgTable("notification_preference", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	consistencyRemindersEnabled: boolean("consistency_reminders_enabled")
		.notNull()
		.default(true),
	inactivityThresholdDays: integer("inactivity_threshold_days")
		.notNull()
		.default(3),
	emailEnabled: boolean("email_enabled").notNull().default(true),
	// De-duplication mechanism for the daily Trigger.dev check (Schema Spec
	// §2.13) — not expressible as a static DB constraint, so it's app logic
	// driven by these two timestamps.
	lastReminderSentAt: timestamp("last_reminder_sent_at", {
		withTimezone: true,
	}),
	lastReminderForActivityAt: timestamp("last_reminder_for_activity_at", {
		withTimezone: true,
	}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
