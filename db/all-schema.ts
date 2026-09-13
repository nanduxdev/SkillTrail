//this file is only for schema visualization tools not for any runtime code and could have unsynced older version of schema
import { defineRelations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  aiGenerationStatusEnum,
  aiOperationEnum,
  contentOriginEnum,
  contentProcessingStatusEnum,
  emojiUsageEnum,
  experienceLevelEnum,
  mediaKindEnum,
  notificationEmailStatusEnum,
  notificationTypeEnum,
  platformEnum,
  publicationFailureReasonEnum,
  publicationStatusEnum,
  researchStatusEnum,
  socialConnectionStatusEnum,
  technicalDepthEnum,
  writingToneEnum,
  xPostTypeEnum,
  xTargetKindEnum,
} from "./schema/enums";

/* ============================================================================
 * BETTER AUTH
 * ============================================================================
 *
 * BETTER AUTH — OWNED TABLES. DO NOT HAND-MAINTAIN.
 *
 * This file mirrors the shape Better Auth's Postgres adapter generates for the
 * enabled plugins (email/password, Google social provider, username plugin).
 *
 * It exists only so SkillTrail's own tables have a real `user` table object
 * to declare foreign keys against in the same schema graph.
 *
 * Regenerate the authoritative version with:
 *   npx @better-auth/cli generate
 *
 * If Better Auth's generated output ever diverges from this file (new plugin,
 * version upgrade, etc.), replace this file with the generated one — never
 * let this drift into being a second, hand-maintained source of truth.
 * ============================================================================
 */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),

  username: text("username").unique(),
  displayUsername: text("display_username"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  token: text("token").notNull().unique(),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
  }).notNull(),

  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),

  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),

  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),

  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
  }).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

/* ============================================================================
 * USER PROFILE
 * ============================================================================
 */

export const applicationProfile = pgTable("application_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  experienceLevel: experienceLevelEnum("experience_level"),

  preferredPlatforms: platformEnum("preferred_platforms")
    .array()
    .notNull()
    .default(sql`'{}'::platform[]`),

  writingTone: writingToneEnum("writing_tone"),
  technicalDepth: technicalDepthEnum("technical_depth"),
  emojiUsage: emojiUsageEnum("emoji_usage"),

  writingInstruction: text("writing_instruction"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const technology = pgTable(
  "technology",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    isCustom: boolean("is_custom").notNull().default(false),

    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
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

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.technologyId],
    }),
  ],
);

export const interest = pgTable(
  "interest",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    isCustom: boolean("is_custom").notNull().default(false),

    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
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

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.interestId],
    }),
  ],
);

/* ============================================================================
 * SOCIAL CONNECTIONS
 * ============================================================================
 */

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

    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),

    tokenExpiresAt: timestamp("token_expires_at", {
      withTimezone: true,
    }),

    scopes: text("scopes").array(),

    status: socialConnectionStatusEnum("status").notNull().default("connected"),

    platformCapabilities: jsonb("platform_capabilities"),

    connectedAt: timestamp("connected_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    disconnectedAt: timestamp("disconnected_at", {
      withTimezone: true,
    }),

    lastCheckedAt: timestamp("last_checked_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("social_connection_identity_idx").on(
      t.platform,
      t.platformUserId,
    ),

    index("social_connection_user_platform_idx").on(t.userId, t.platform),
  ],
);

/* ============================================================================
 * MEDIA
 * ============================================================================
 */
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

    sizeBytes: bigint("size_bytes", {
      mode: "number",
    }).notNull(),

    width: integer("width"),
    height: integer("height"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("media_user_idx").on(t.userId)],
);

/* ============================================================================
 * RESEARCH
 * ============================================================================
 */

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

    triggerTaskId: text("trigger_task_id"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),
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

  fetchedAt: timestamp("fetched_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

/* ============================================================================
 * DISCOVERY
 * ============================================================================
 */
export const discoveryItem = pgTable(
  "discovery_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    externalKey: text("external_key").notNull().unique(),

    title: text("title").notNull(),
    summary: text("summary").notNull(),
    whyItMatters: text("why_it_matters"),

    category: text("category").notNull(),

    sourceUrl: text("source_url"),
    sourceName: text("source_name"),

    suggestedAngles: text("suggested_angles").array(),

    publishedAt: timestamp("published_at", {
      withTimezone: true,
    }),

    ingestedAt: timestamp("ingested_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("discovery_item_category_idx").on(t.category, t.archivedAt)],
);
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

    seenAt: timestamp("seen_at", {
      withTimezone: true,
    }),

    savedAt: timestamp("saved_at", {
      withTimezone: true,
    }),

    dismissedAt: timestamp("dismissed_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.discoveryItemId],
    }),

    index("user_discovery_item_feed_idx").on(
      t.userId,
      t.dismissedAt,
      t.savedAt,
    ),
  ],
);

/* ============================================================================
 * CONTENT
 * ============================================================================
 */

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

    discoveryItemId: uuid("discovery_item_id").references(
      () => discoveryItem.id,
      {
        onDelete: "set null",
      },
    ),

    processingStatus: contentProcessingStatusEnum("processing_status")
      .notNull()
      .default("raw"),

    understandingResult: jsonb("understanding_result"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("content_user_idx").on(t.userId)],
);
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

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.contentId, t.mediaId],
    }),
  ],
);
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

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
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

/* ============================================================================
 * COMPOSITION
 * ============================================================================
 */
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

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("composition_content_idx").on(t.contentId)],
);

/* ============================================================================
 * DRAFT
 * ============================================================================
 */
export const draft = pgTable(
  "draft",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    compositionId: uuid("composition_id")
      .notNull()
      .references(() => composition.id, { onDelete: "cascade" }),

    platform: platformEnum("platform").notNull(),

    aiAssisted: boolean("ai_assisted").notNull().default(false),

    bodyText: text("body_text"),

    xPostType: xPostTypeEnum("x_post_type"),

    targetKind: xTargetKindEnum("target_kind"),

    targetExternalPostId: uuid("target_external_post_id").references(
      (): AnyPgColumn => xExternalPost.id,
      {
        onDelete: "set null",
      },
    ),

    targetPublicationId: uuid("target_publication_id").references(
      (): AnyPgColumn => publication.id,
      {
        onDelete: "set null",
      },
    ),

    pendingAiGenerationId: uuid("pending_ai_generation_id").references(
      (): AnyPgColumn => aiGeneration.id,
      {
        onDelete: "set null",
      },
    ),

    currentAiGenerationId: uuid("current_ai_generation_id").references(
      (): AnyPgColumn => aiGeneration.id,
      {
        onDelete: "set null",
      },
    ),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
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

/* ============================================================================
 * X THREADS
 * ============================================================================
 */

export const xThreadPost = pgTable(
  "x_thread_post",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    draftId: uuid("draft_id")
      .notNull()
      .references((): AnyPgColumn => draft.id, {
        onDelete: "cascade",
      }),

    position: smallint("position").notNull(),

    bodyText: text("body_text").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("x_thread_post_position_idx").on(t.draftId, t.position)],
);

export const xExternalPost = pgTable(
  "x_external_post",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    socialConnectionId: uuid("social_connection_id")
      .notNull()
      .references(() => socialConnection.id, {
        onDelete: "cascade",
      }),

    platformPostId: text("platform_post_id").notNull(),

    authorHandle: text("author_handle"),
    textSnippet: text("text_snippet"),

    postedAt: timestamp("posted_at", {
      withTimezone: true,
    }),

    fetchedAt: timestamp("fetched_at", {
      withTimezone: true,
    })
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

/* ============================================================================
 * AI GENERATION
 * ============================================================================
 */

export const aiGeneration = pgTable(
  "ai_generation",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    draftId: uuid("draft_id")
      .notNull()
      .references(() => draft.id, {
        onDelete: "cascade",
      }),

    targetXThreadPostId: uuid("target_x_thread_post_id").references(
      () => xThreadPost.id,
      {
        onDelete: "set null",
      },
    ),

    operation: aiOperationEnum("operation").notNull(),

    status: aiGenerationStatusEnum("status").notNull().default("pending"),

    instruction: text("instruction"),

    beforeText: text("before_text"),

    afterText: text("after_text").notNull(),

    provider: text("provider").notNull(),
    model: text("model").notNull(),

    latencyMs: integer("latency_ms"),
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),

    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
    }),
  },
  (t) => [index("ai_generation_draft_created_idx").on(t.draftId, t.createdAt)],
);

/* ============================================================================
 * DRAFT MEDIA
 * ============================================================================
 */

export const draftMedia = pgTable(
  "draft_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    draftId: uuid("draft_id")
      .notNull()
      .references(() => draft.id, {
        onDelete: "cascade",
      }),

    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, {
        onDelete: "restrict",
      }),

    xThreadPostId: uuid("x_thread_post_id").references(() => xThreadPost.id, {
      onDelete: "cascade",
    }),

    position: smallint("position").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("draft_media_body_unique_idx")
      .on(t.draftId, t.mediaId)
      .where(sql`${t.xThreadPostId} is null`),

    uniqueIndex("draft_media_thread_post_unique_idx")
      .on(t.draftId, t.mediaId, t.xThreadPostId)
      .where(sql`${t.xThreadPostId} is not null`),
  ],
);

/* ============================================================================
 * PUBLICATION
 * ============================================================================
 */

export const publication = pgTable(
  "publication",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    compositionId: uuid("composition_id")
      .notNull()
      .references(() => composition.id, {
        onDelete: "restrict",
      }),

    draftId: uuid("draft_id").references(() => draft.id, {
      onDelete: "set null",
    }),

    platform: platformEnum("platform").notNull(),

    socialConnectionId: uuid("social_connection_id").references(
      () => socialConnection.id,
      {
        onDelete: "set null",
      },
    ),

    status: publicationStatusEnum("status").notNull().default("scheduled"),

    scheduledFor: timestamp("scheduled_for", {
      withTimezone: true,
    }),

    publishedAt: timestamp("published_at", {
      withTimezone: true,
    }),

    snapshot: jsonb("snapshot").notNull(),

    externalPostId: text("external_post_id"),
    externalPostUrl: text("external_post_url"),

    triggerTaskId: text("trigger_task_id"),

    attemptCount: integer("attempt_count").notNull().default(0),

    lastError: text("last_error"),

    failureReason: publicationFailureReasonEnum("failure_reason"),

    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
    }),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
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

/* ============================================================================
 * NOTIFICATIONS
 * ============================================================================
 */

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    type: notificationTypeEnum("type").notNull(),

    title: text("title").notNull(),
    body: text("body").notNull(),

    readAt: timestamp("read_at", {
      withTimezone: true,
    }),

    emailStatus: notificationEmailStatusEnum("email_status")
      .notNull()
      .default("not_applicable"),

    emailSentAt: timestamp("email_sent_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notification_user_read_idx").on(t.userId, t.readAt)],
);

export const notificationPreference = pgTable("notification_preference", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  consistencyRemindersEnabled: boolean("consistency_reminders_enabled")
    .notNull()
    .default(true),

  inactivityThresholdDays: integer("inactivity_threshold_days")
    .notNull()
    .default(3),

  emailEnabled: boolean("email_enabled").notNull().default(true),

  lastReminderSentAt: timestamp("last_reminder_sent_at", {
    withTimezone: true,
  }),

  lastReminderForActivityAt: timestamp("last_reminder_for_activity_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

/* ============================================================================
 * SCHEMA OBJECT
 * ============================================================================
 *
 * All tables live in this file now, so this replaces the cross-file schema
 * aggregation that previously existed implicitly across imports.
 * ============================================================================
 */

export const schema = {
  user,
  session,
  account,
  verification,

  applicationProfile,
  technology,
  userTechnology,
  interest,
  userInterest,

  socialConnection,

  media,

  research,
  researchSource,

  discoveryItem,
  userDiscoveryItem,

  content,
  contentContextMedia,
  angle,

  composition,
  draft,

  xThreadPost,
  xExternalPost,

  aiGeneration,

  draftMedia,

  publication,

  notification,
  notificationPreference,
};

/* ============================================================================
 * RELATIONS
 * ============================================================================
 */

export const relations = defineRelations(schema, (r) => ({
  /* --------------------------------------------------------------------------
   * USER
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * APPLICATION PROFILE
   * -------------------------------------------------------------------------- */

  applicationProfile: {
    user: r.one.user({
      from: r.applicationProfile.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  /* --------------------------------------------------------------------------
   * TECHNOLOGY
   * -------------------------------------------------------------------------- */

  technology: {
    users: r.many.user({
      from: r.technology.id.through(r.userTechnology.technologyId),
      to: r.user.id.through(r.userTechnology.userId),
    }),
  },

  /* --------------------------------------------------------------------------
   * INTEREST
   * -------------------------------------------------------------------------- */

  interest: {
    users: r.many.user({
      from: r.interest.id.through(r.userInterest.interestId),
      to: r.user.id.through(r.userInterest.userId),
    }),
  },

  /* --------------------------------------------------------------------------
   * SOCIAL CONNECTION
   * -------------------------------------------------------------------------- */

  socialConnection: {
    user: r.one.user({
      from: r.socialConnection.userId,
      to: r.user.id,
      optional: false,
    }),

    publications: r.many.publication(),

    externalPosts: r.many.xExternalPost(),
  },

  /* --------------------------------------------------------------------------
   * MEDIA
   * -------------------------------------------------------------------------- */

  media: {
    user: r.one.user({
      from: r.media.userId,
      to: r.user.id,
      optional: false,
    }),

    contextUsages: r.many.contentContextMedia(),

    draftUsages: r.many.draftMedia(),
  },

  /* --------------------------------------------------------------------------
   * RESEARCH
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * DISCOVERY
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * CONTENT
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * ANGLE
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * COMPOSITION
   * -------------------------------------------------------------------------- */

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

    drafts: r.many.draft(),

    publications: r.many.publication(),
  },

  /* --------------------------------------------------------------------------
   * DRAFT
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * X THREAD POST
   * -------------------------------------------------------------------------- */

  xThreadPost: {
    draft: r.one.draft({
      from: r.xThreadPost.draftId,
      to: r.draft.id,
      optional: false,
    }),

    mediaAttachments: r.many.draftMedia(),

    aiGenerations: r.many.aiGeneration(),
  },

  /* --------------------------------------------------------------------------
   * X EXTERNAL POST
   * -------------------------------------------------------------------------- */

  xExternalPost: {
    socialConnection: r.one.socialConnection({
      from: r.xExternalPost.socialConnectionId,
      to: r.socialConnection.id,
      optional: false,
    }),
  },

  /* --------------------------------------------------------------------------
   * DRAFT MEDIA
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * PUBLICATION
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * AI GENERATION
   * -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
   * NOTIFICATION
   * -------------------------------------------------------------------------- */

  notification: {
    user: r.one.user({
      from: r.notification.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  /* --------------------------------------------------------------------------
   * NOTIFICATION PREFERENCE
   * -------------------------------------------------------------------------- */

  notificationPreference: {
    user: r.one.user({
      from: r.notificationPreference.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));
