import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { platformEnum, socialConnectionStatusEnum } from "./enums";

// A publishing authorization, distinct from Better Auth's `account` table
// (Engineering Spec §19). Never expose tokens to client code.
export const socialConnection = pgTable(
  "social_connection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
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
    connectedAt: timestamp("connected_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    disconnectedAt: timestamp("disconnected_at", { withTimezone: true }),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
