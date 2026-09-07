import {
  bigint,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";
import { draft } from "./composition";
import { xThreadPost } from "./x";
import { mediaKindEnum } from "./enums";

// Reusable library asset. Binary lives in Cloudflare R2; this row is
// metadata + storage reference only (Schema Spec §2.8).
export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: mediaKindEnum("kind").notNull(),
    storageKey: text("storage_key").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    // Only meaningful when kind = 'image'.
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_user_idx").on(t.userId)],
);

// Publishing media attached to a Draft (not Publication — the draft is the
// mutable working state; at schedule/publish time, media + order are copied
// into publication.snapshot for immutability). Scoped to a specific
// x_thread_post when the draft is a thread; null there for LinkedIn / any
// single-body X post. Schema Spec §2.8.
export const draftMedia = pgTable(
  "draft_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    draftId: uuid("draft_id")
      .notNull()
      .references(() => draft.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    xThreadPostId: uuid("x_thread_post_id").references(() => xThreadPost.id, {
      onDelete: "cascade",
    }),
    position: smallint("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Same media can't appear twice in one draft body...
    uniqueIndex("draft_media_body_unique_idx")
      .on(t.draftId, t.mediaId)
      .where(sql`${t.xThreadPostId} is null`),
    // ...or twice within the same thread post.
    uniqueIndex("draft_media_thread_post_unique_idx")
      .on(t.draftId, t.mediaId, t.xThreadPostId)
      .where(sql`${t.xThreadPostId} is not null`),
  ],
);
