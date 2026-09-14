import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { angle, content } from "./content";
import { xExternalPost } from "./x";
import { publication } from "./publication";
import { aiGeneration } from "./ai";
import { platformEnum, xPostTypeEnum, xTargetKindEnum } from "./enums";

// One Content -> many Compositions. Regenerate = new ai_generation on the
// same Composition; Change Angle = new Composition (Schema Spec §2.6).
export const composition = pgTable(
	"composition",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		contentId: uuid("content_id")
			.notNull()
			.references(() => content.id, { onDelete: "cascade" }),
		angleId: uuid("angle_id").references(() => angle.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [index("composition_content_idx").on(t.contentId)],
);

// Exactly one row per (composition, platform), mutated in place — never
// versioned as multiple rows. All history lives in ai_generation instead.
// See Schema Spec §2.6 for why "archived draft" isn't a concept here.
export const draft = pgTable(
	"draft",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		compositionId: uuid("composition_id")
			.notNull()
			.references(() => composition.id, { onDelete: "cascade" }),
		platform: platformEnum("platform").notNull(),

		// Has AI ever touched this draft. Simpler than an enum "source" field
		// since a manual draft can become AI-assisted mid-life.
		aiAssisted: boolean("ai_assisted").notNull().default(false),

		// Current text. For X threads (xPostType = 'thread'), this stays NULL —
		// the text lives per-item in x_thread_post rows instead.
		bodyText: text("body_text"),

		// Only populated when platform = 'x'.
		xPostType: xPostTypeEnum("x_post_type"),

		// Reply/quote target — meaning disambiguated by xPostType, since a draft
		// is exactly one xPostType at a time (Schema Spec §2.7).
		targetKind: xTargetKindEnum("target_kind"),
		targetExternalPostId: uuid("target_external_post_id").references(
			(): AnyPgColumn => xExternalPost.id,
			{ onDelete: "set null" },
		),
		targetPublicationId: uuid("target_publication_id").references(
			(): AnyPgColumn => publication.id,
			{ onDelete: "set null" },
		),

		// Mechanism for "proposal survives refresh" / "manual edit blocked while
		// pending" / "show current accepted version" — Schema Spec §2.6 / §2.10.
		pendingAiGenerationId: uuid("pending_ai_generation_id").references(
			(): AnyPgColumn => aiGeneration.id,
			{ onDelete: "set null" },
		),
		currentAiGenerationId: uuid("current_ai_generation_id").references(
			(): AnyPgColumn => aiGeneration.id,
			{ onDelete: "set null" },
		),

		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		uniqueIndex("draft_composition_platform_idx").on(
			t.compositionId,
			t.platform,
		),
	],
);
