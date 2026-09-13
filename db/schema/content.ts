import {
  check,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";
import { media } from "./media";
import { research } from "./research";
import { discoveryItem } from "./discovery";
import { contentOriginEnum, contentProcessingStatusEnum } from "./enums";

export const content = pgTable(
  "content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rawText: text("raw_text"),
    origin: contentOriginEnum("origin").notNull().default("manual"),
    researchId: uuid("research_id").references(() => research.id, {
      onDelete: "set null",
    }),
    discoveryItemId: uuid("discovery_item_id").references(
      () => discoveryItem.id,
      {
        onDelete: "set null",
      },
    ),
    // [ASSUMPTION] see Schema Spec §2.4 — tracks the content-understanding
    // step only, not the composition/draft/publication pipeline stages.
    processingStatus: contentProcessingStatusEnum("processing_status")
      .notNull()
      .default("raw"),
    // Cached AiProvider.understandContent() output: problem / approach /
    // solution / challenges / learning / interesting details. Regenerable
    // supporting data, not a reviewable AI proposal — see Schema Spec §2.10.
    understandingResult: jsonb("understanding_result"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("content_user_idx").on(t.userId)],
);

// AI-context attachments. No ordering needed (context order doesn't affect
// AI input meaningfully) — contrast with draft_media, which does need order.
export const contentContextMedia = pgTable(
  "content_context_media",
  {
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.contentId, t.mediaId] })],
);

// Shared between Content and Research (Schema Spec §2.5) — exactly one
// parent is set, enforced by the CHECK constraint below.
export const angle = pgTable(
  "angle",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id").references(() => content.id, {
      onDelete: "cascade",
    }),
    researchId: uuid("research_id").references(() => research.id, {
      onDelete: "cascade",
    }),
    label: text("label").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "angle_exactly_one_parent",
      sql`(${t.contentId} is not null) <> (${t.researchId} is not null)`,
    ),
  ],
);
