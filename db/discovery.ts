import {
  index,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Global, unowned. Ingested by a background Trigger.dev job.
export const discoveryItem = pgTable(
  "discovery_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Dedup key decided at ingestion (normalized source URL or content hash).
    externalKey: text("external_key").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    whyItMatters: text("why_it_matters"),
    // Plain text, not an enum — categories evolve based on user behavior
    // per the PRD; a fixed enum can't grow without a migration each time.
    category: text("category").notNull(),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    // Display-only bullet strings shown to every viewer of the feed — no
    // accept/reject lifecycle, no per-user selection. Deliberately NOT the
    // `angle` table; see Schema Spec §2.12 for why this case is different.
    suggestedAngles: text("suggested_angles").array(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
    // Soft-archive out of the active feed without breaking
    // content.discovery_item_id references from posts already created.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("discovery_item_category_idx").on(t.category, t.archivedAt)],
);

// Global item + per-user personalization/interaction state (Schema Spec §2.12)
// — never a copied-per-user discovery record.
export const userDiscoveryItem = pgTable(
  "user_discovery_item",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    discoveryItemId: uuid("discovery_item_id")
      .notNull()
      .references(() => discoveryItem.id, { onDelete: "cascade" }),
    relevanceScore: real("relevance_score"),
    seenAt: timestamp("seen_at", { withTimezone: true }),
    savedAt: timestamp("saved_at", { withTimezone: true }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.discoveryItemId] }),
    index("user_discovery_item_feed_idx").on(t.userId, t.dismissedAt, t.savedAt),
  ],
);
