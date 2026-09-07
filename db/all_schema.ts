import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { draft } from "./composition";
import { aiGenerationStatusEnum, aiOperationEnum } from "./enums";
import { xThreadPost } from "./x";

// Persisted AI proposal/version history, scoped to Draft (Schema Spec
// §2.10). One table covers the entire review/undo/compare/restore lifecycle
// via `status` + the two pointer columns on `draft`
// (pendingAiGenerationId / currentAiGenerationId) — no separate proposal
// table. Content-level operations (understandContent, generateAngles) are
// NOT rows here; they populate content.understandingResult and `angle`
// directly, since accept/reject/undo semantics don't apply to them.
export const aiGeneration = pgTable(
  "ai_generation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    draftId: uuid("draft_id")
      .notNull()
      .references(() => draft.id, { onDelete: "cascade" }),
    // Scopes a thread-level operation to one item vs. the whole draft.
    // SET NULL (not cascade) so draft-level AI history survives even if the
    // specific thread-post row is later removed by the user.
    targetXThreadPostId: uuid("target_x_thread_post_id").references(
      () => xThreadPost.id,
      { onDelete: "set null" },
    ),

    operation: aiOperationEnum("operation").notNull(),
    status: aiGenerationStatusEnum("status").notNull().default("pending"),

    // The natural-language edit instruction, e.g. "make it more casual".
    // Null for a plain generate/regenerate with no specific instruction.
    instruction: text("instruction"),
    // Null for the very first generation (no prior state to diff against).
    beforeText: text("before_text"),
    afterText: text("after_text").notNull(),

    provider: text("provider").notNull(),
    model: text("model").notNull(),
    latencyMs: integer("latency_ms"),
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("ai_generation_draft_created_idx").on(t.draftId, t.createdAt)],
);

/**
 * BETTER AUTH — OWNED TABLES. DO NOT HAND-MAINTAIN.
 *
 * This file mirrors the shape Better Auth's Postgres adapter generates for the
 * enabled plugins (email/password, Google social provider, username plugin).
 * It exists only so CommitStory's own tables have a real `user` table object
 * to declare foreign keys against in the same schema graph.
 *
 * Regenerate the authoritative version with:
 *   npx @better-auth/cli generate
 *
 * If Better Auth's generated output ever diverges from this file (new plugin,
 * version upgrade, etc.), replace this file with the generated one — never
 * let this drift into being a second, hand-maintained source of truth.
 */
import { boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Added by the username plugin.
  username: text("username").unique(),
  displayUsername: text("display_username"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Better Auth's `account` table backs email/password credentials AND the
// Google OAuth link. It is NOT the place LinkedIn/X publishing tokens live —
// see social_connection.ts, which is a separate, CommitStory-owned concept
// (Engineering Spec §19).
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

import {
    uniqueIndex,
    type AnyPgColumn
} from "drizzle-orm/pg-core";
import { aiGeneration } from "./ai";
import { angle, content } from "./content";
import { platformEnum, xPostTypeEnum, xTargetKindEnum } from "./enums";
import { publication } from "./publication";
import { xExternalPost } from "./x";

// One Content -> many Compositions. Regenerate = new ai_generation on the
// same Composition; Change Angle = new Composition (Schema Spec §2.6).
export const composition = pgTable(
  "composition",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    angleId: uuid("angle_id").references(() => angle.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("draft_composition_platform_idx").on(t.compositionId, t.platform),
  ],
);

import { sql } from "drizzle-orm";
import {
    check,
    jsonb,
    primaryKey
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { discoveryItem } from "./discovery";
import { contentOriginEnum, contentProcessingStatusEnum } from "./enums";
import { media } from "./media";
import { research } from "./research";

export const content = pgTable(
  "content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rawText: text("raw_text"),
    origin: contentOriginEnum("origin").notNull().default("manual"),
    researchId: uuid("research_id").references(() => research.id, {
      onDelete: "set null",
    }),
    discoveryItemId: uuid("discovery_item_id").references(() => discoveryItem.id, {
      onDelete: "set null",
    }),
    // [ASSUMPTION] see Schema Spec §2.4 — tracks the content-understanding
    // step only, not the composition/draft/publication pipeline stages.
    processingStatus: contentProcessingStatusEnum("processing_status")
      .notNull()
      .default("raw"),
    // Cached AiProvider.understandContent() output: problem / approach /
    // solution / challenges / learning / interesting details. Regenerable
    // supporting data, not a reviewable AI proposal — see Schema Spec §2.10.
    understandingResult: jsonb("understanding_result"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "angle_exactly_one_parent",
      sql`(${t.contentId} is not null) <> (${t.researchId} is not null)`,
    ),
  ],
);

import {
    real
} from "drizzle-orm/pg-core";

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

import {
    bigint,
    smallint
} from "drizzle-orm/pg-core";
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

import { notificationEmailStatusEnum, notificationTypeEnum } from "./enums";

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notification_user_read_idx").on(t.userId, t.readAt)],
);

export const notificationPreference = pgTable("notification_preference", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  consistencyRemindersEnabled: boolean("consistency_reminders_enabled")
    .notNull()
    .default(true),
  inactivityThresholdDays: integer("inactivity_threshold_days").notNull().default(3),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  // De-duplication mechanism for the daily Trigger.dev check (Schema Spec
  // §2.13) — not expressible as a static DB constraint, so it's app logic
  // driven by these two timestamps.
  lastReminderSentAt: timestamp("last_reminder_sent_at", { withTimezone: true }),
  lastReminderForActivityAt: timestamp("last_reminder_for_activity_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

import {
    emojiUsageEnum,
    experienceLevelEnum,
    technicalDepthEnum,
    writingToneEnum
} from "./enums";

// 1:1 with `user`. name/username live on Better Auth's `user` row (username
// plugin) — not duplicated here. See Schema Spec §2.2.
export const applicationProfile = pgTable("application_profile", {
  userId: text("user_id")
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("technology_name_lower_idx").on(sql`lower(${t.name})`)],
);

export const userTechnology = pgTable(
  "user_technology",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technology.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("interest_name_lower_idx").on(sql`lower(${t.name})`)],
);

export const userInterest = pgTable(
  "user_interest",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    interestId: uuid("interest_id")
      .notNull()
      .references(() => interest.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.interestId] })],
);

import { composition } from "./composition";
import {
    publicationFailureReasonEnum,
    publicationStatusEnum
} from "./enums";
import { socialConnection } from "./social";

// External publishing lifecycle/history — deliberately separate from Draft
// (Schema Spec §2.9). userId is denormalized here (justified per §3 —
// dashboard's primary queries are (user_id, status) and (scheduled_for)).
export const publication = pgTable(
  "publication",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // RESTRICT — this is the enforcement point that blocks Content deletion
    // while a live publication exists anywhere in its composition tree.
    compositionId: uuid("composition_id")
      .notNull()
      .references(() => composition.id, { onDelete: "restrict" }),
    // Traceability only ("created from this draft") — never the source of
    // truth for what was actually published; that's `snapshot` below.
    draftId: uuid("draft_id").references(() => draft.id, { onDelete: "set null" }),

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

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("publication_user_status_idx").on(t.userId, t.status),
    index("publication_scheduled_idx")
      .on(t.scheduledFor)
      .where(sql`${t.status} = 'scheduled'`),
    index("publication_composition_idx").on(t.compositionId),
  ],
);


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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("x_thread_post_position_idx").on(t.draftId, t.position)],
);

// Lightweight cache of an external X post fetched via the reply/quote/thread
// -continuation picker. NOT a Publication — this may be a post made outside
// CommitStory entirely. Schema Spec §2.7.
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
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("x_external_post_identity_idx").on(
      t.socialConnectionId,
      t.platformPostId,
    ),
  ],
);

import { socialConnectionStatusEnum } from "./enums";

// A publishing authorization, distinct from Better Auth's `account` table
// (Engineering Spec §19). Never expose tokens to client code.
export const socialConnection = pgTable(
  "social_connection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    platformUserId: text("platform_user_id").notNull(),
    platformUsername: text("platform_username"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    // Server-only. Encrypt at rest at the application layer before insert.
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    scopes: text("scopes").array(),
    status: socialConnectionStatusEnum("status").notNull().default("connected"),
    // Platform-divergent capability data (e.g. X premium tier -> char limit,
    // LinkedIn org admin rights). JSONB because the two platforms share
    // almost no fields — see Schema Spec §2.3.
    platformCapabilities: jsonb("platform_capabilities"),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    disconnectedAt: timestamp("disconnected_at", { withTimezone: true }),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Global external-identity ownership. One X/LinkedIn account → one user.
    uniqueIndex("social_connection_identity_idx").on(
      t.platform,
      t.platformUserId,
    ),
    // Lookup only. Not unique: a user may have multiple accounts per platform.
    index("social_connection_user_platform_idx").on(t.userId, t.platform),
  ],
);

import { researchStatusEnum } from "./enums";

export const research = pgTable(
  "research",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    status: researchStatusEnum("status").notNull().default("running"),
    synthesis: text("synthesis"),
    // Populated only when research runs through Trigger.dev (long-running /
    // multi-source / retry-prone). Null for fast synchronous research.
    triggerTaskId: text("trigger_task_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("research_user_idx").on(t.userId)],
);

export const researchSource = pgTable("research_source", {
  id: uuid("id").defaultRandom().primaryKey(),
  researchId: uuid("research_id")
    .notNull()
    .references(() => research.id, { onDelete: "cascade" }),
  url: text("url"),
  title: text("title"),
  snippet: text("snippet"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const relations = defineRelations(schema, (r) => ({
  user: {
    applicationProfile: r.one.applicationProfile({
      from: r.user.id,
      to: r.applicationProfile.userId,
    }),
    technologies: r.many.technology({
      from: r.user.id.through(r.userTechnology.userId),
      to: r.technology.id.through(r.userTechnology.technologyId),
    }),
    interests: r.many.interest({
      from: r.user.id.through(r.userInterest.userId),
      to: r.interest.id.through(r.userInterest.interestId),
    }),
    socialConnections: r.many.socialConnection(),
    media: r.many.media(),
    content: r.many.content(),
    research: r.many.research(),
    publications: r.many.publication(),
    notifications: r.many.notification(),
    notificationPreference: r.one.notificationPreference({
      from: r.user.id,
      to: r.notificationPreference.userId,
    }),
    discoveryFeed: r.many.userDiscoveryItem(),
  },

  applicationProfile: {
    user: r.one.user({
      from: r.applicationProfile.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  technology: {
    users: r.many.user({
      from: r.technology.id.through(r.userTechnology.technologyId),
      to: r.user.id.through(r.userTechnology.userId),
    }),
  },

  interest: {
    users: r.many.user({
      from: r.interest.id.through(r.userInterest.interestId),
      to: r.user.id.through(r.userInterest.userId),
    }),
  },

  socialConnection: {
    user: r.one.user({
      from: r.socialConnection.userId,
      to: r.user.id,
      optional: false,
    }),
    publications: r.many.publication(),
    externalPosts: r.many.xExternalPost(),
  },

  content: {
    user: r.one.user({
      from: r.content.userId,
      to: r.user.id,
      optional: false,
    }),
    research: r.one.research({
      from: r.content.researchId,
      to: r.research.id,
    }),
    discoveryItem: r.one.discoveryItem({
      from: r.content.discoveryItemId,
      to: r.discoveryItem.id,
    }),
    contextAttachments: r.many.contentContextMedia(),
    angles: r.many.angle(),
    compositions: r.many.composition(),
  },

  contentContextMedia: {
    content: r.one.content({
      from: r.contentContextMedia.contentId,
      to: r.content.id,
      optional: false,
    }),
    media: r.one.media({
      from: r.contentContextMedia.mediaId,
      to: r.media.id,
      optional: false,
    }),
  },

  angle: {
    content: r.one.content({
      from: r.angle.contentId,
      to: r.content.id,
    }),
    research: r.one.research({
      from: r.angle.researchId,
      to: r.research.id,
    }),
    compositions: r.many.composition(),
  },

  composition: {
    content: r.one.content({
      from: r.composition.contentId,
      to: r.content.id,
      optional: false,
    }),
    angle: r.one.angle({
      from: r.composition.angleId,
      to: r.angle.id,
    }),
    // A Composition can have up to one Draft per platform (LinkedIn + X) —
    // never a single `one` relation. Enforced by the unique constraint on
    // draft (composition_id, platform), not by the relation shape.
    drafts: r.many.draft(),
    publications: r.many.publication(),
  },

  draft: {
    composition: r.one.composition({
      from: r.draft.compositionId,
      to: r.composition.id,
      optional: false,
    }),
    threadPosts: r.many.xThreadPost(),
    mediaAttachments: r.many.draftMedia(),
    aiGenerations: r.many.aiGeneration(),
    pendingAiGeneration: r.one.aiGeneration({
      from: r.draft.pendingAiGenerationId,
      to: r.aiGeneration.id,
      alias: "draft_pending_ai_generation",
    }),
    currentAiGeneration: r.one.aiGeneration({
      from: r.draft.currentAiGenerationId,
      to: r.aiGeneration.id,
      alias: "draft_current_ai_generation",
    }),
    targetExternalPost: r.one.xExternalPost({
      from: r.draft.targetExternalPostId,
      to: r.xExternalPost.id,
    }),
    targetPublication: r.one.publication({
      from: r.draft.targetPublicationId,
      to: r.publication.id,
      alias: "draft_target_publication",
    }),
    publications: r.many.publication({
      alias: "publication_source_draft",
    }),
  },

  xThreadPost: {
    draft: r.one.draft({
      from: r.xThreadPost.draftId,
      to: r.draft.id,
      optional: false,
    }),
    mediaAttachments: r.many.draftMedia(),
    aiGenerations: r.many.aiGeneration(),
  },

  xExternalPost: {
    socialConnection: r.one.socialConnection({
      from: r.xExternalPost.socialConnectionId,
      to: r.socialConnection.id,
      optional: false,
    }),
  },

  media: {
    user: r.one.user({
      from: r.media.userId,
      to: r.user.id,
      optional: false,
    }),
    contextUsages: r.many.contentContextMedia(),
    draftUsages: r.many.draftMedia(),
  },

  draftMedia: {
    draft: r.one.draft({
      from: r.draftMedia.draftId,
      to: r.draft.id,
      optional: false,
    }),
    media: r.one.media({
      from: r.draftMedia.mediaId,
      to: r.media.id,
      optional: false,
    }),
    xThreadPost: r.one.xThreadPost({
      from: r.draftMedia.xThreadPostId,
      to: r.xThreadPost.id,
    }),
  },

  publication: {
    user: r.one.user({
      from: r.publication.userId,
      to: r.user.id,
      optional: false,
    }),
    composition: r.one.composition({
      from: r.publication.compositionId,
      to: r.composition.id,
      optional: false,
    }),
    sourceDraft: r.one.draft({
      from: r.publication.draftId,
      to: r.draft.id,
      alias: "publication_source_draft",
    }),
    socialConnection: r.one.socialConnection({
      from: r.publication.socialConnectionId,
      to: r.socialConnection.id,
    }),
  },

  aiGeneration: {
    draft: r.one.draft({
      from: r.aiGeneration.draftId,
      to: r.draft.id,
      optional: false,
    }),
    targetXThreadPost: r.one.xThreadPost({
      from: r.aiGeneration.targetXThreadPostId,
      to: r.xThreadPost.id,
    }),
  },

  research: {
    user: r.one.user({
      from: r.research.userId,
      to: r.user.id,
      optional: false,
    }),
    sources: r.many.researchSource(),
    angles: r.many.angle(),
    contents: r.many.content(),
  },

  researchSource: {
    research: r.one.research({
      from: r.researchSource.researchId,
      to: r.research.id,
      optional: false,
    }),
  },

  discoveryItem: {
    userStates: r.many.userDiscoveryItem(),
    contents: r.many.content(),
  },

  userDiscoveryItem: {
    user: r.one.user({
      from: r.userDiscoveryItem.userId,
      to: r.user.id,
      optional: false,
    }),
    discoveryItem: r.one.discoveryItem({
      from: r.userDiscoveryItem.discoveryItemId,
      to: r.discoveryItem.id,
      optional: false,
    }),
  },

  notification: {
    user: r.one.user({
      from: r.notification.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  notificationPreference: {
    user: r.one.user({
      from: r.notificationPreference.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));
