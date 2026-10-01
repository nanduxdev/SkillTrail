import { z } from "zod";

// ─── Canonical tuple constants ────────────────────────────────────────────────
// Each tuple is the single source of truth for both the Drizzle pgEnum
// (imported in db/schema/enums.ts) and the Zod schema below.
// Dependency direction: db/schema → lib/schemas, never the reverse.

export const PLATFORMS = ["linkedin", "x"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const EXPERIENCE_LEVELS = [
	"student",
	"junior",
	"mid_level",
	"senior",
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const WRITING_TONES = ["casual", "balanced", "formal"] as const;
export type WritingTone = (typeof WRITING_TONES)[number];

export const TECHNICAL_DEPTHS = [
	"beginner_friendly",
	"detailed",
	"expert",
] as const;
export type TechnicalDepth = (typeof TECHNICAL_DEPTHS)[number];

export const EMOJI_USAGES = ["none", "minimal", "frequent"] as const;
export type EmojiUsage = (typeof EMOJI_USAGES)[number];

export const SOCIAL_CONNECTION_STATUSES = [
	"connected",
	"disconnected",
	"expired",
	"revoked",
] as const;
export type SocialConnectionStatus =
	(typeof SOCIAL_CONNECTION_STATUSES)[number];

export const MEDIA_KINDS = ["image", "document"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const CONTENT_ORIGINS = ["manual", "research", "discovery"] as const;
export type ContentOrigin = (typeof CONTENT_ORIGINS)[number];

export const CONTENT_PROCESSING_STATUSES = [
	"raw",
	"analyzing",
	"understood",
	"failed",
] as const;
export type ContentProcessingStatus =
	(typeof CONTENT_PROCESSING_STATUSES)[number];

export const X_POST_TYPES = [
	"standalone",
	"reply",
	"self_reply",
	"thread",
	"quote",
] as const;
export type XPostType = (typeof X_POST_TYPES)[number];

export const X_TARGET_KINDS = ["external", "own_publication"] as const;
export type XTargetKind = (typeof X_TARGET_KINDS)[number];

export const PUBLICATION_STATUSES = [
	"scheduled",
	"publishing",
	"published",
	"publish_failed",
	"cancelled",
	"deleted",
	"delete_failed",
] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const PUBLICATION_FAILURE_REASONS = [
	"account_disconnected",
	"platform_error",
	"rate_limited",
	"validation_error",
	"unknown",
] as const;
export type PublicationFailureReason =
	(typeof PUBLICATION_FAILURE_REASONS)[number];

export const AI_OPERATIONS = [
	"generate_draft",
	"edit_draft",
	"regenerate",
	"restore",
] as const;
export type AiOperation = (typeof AI_OPERATIONS)[number];

export const AI_GENERATION_STATUSES = [
	"pending",
	"accepted",
	"rejected",
	"failed",
] as const;
export type AiGenerationStatus = (typeof AI_GENERATION_STATUSES)[number];

export const RESEARCH_STATUSES = ["running", "completed", "failed"] as const;
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

export const NOTIFICATION_TYPES = ["consistency_reminder"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_EMAIL_STATUSES = [
	"not_applicable",
	"sent",
	"failed",
] as const;
export type NotificationEmailStatus =
	(typeof NOTIFICATION_EMAIL_STATUSES)[number];

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const platformSchema = z.enum(PLATFORMS);
export const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);
export const writingToneSchema = z.enum(WRITING_TONES);
export const technicalDepthSchema = z.enum(TECHNICAL_DEPTHS);
export const emojiUsageSchema = z.enum(EMOJI_USAGES);
export const socialConnectionStatusSchema = z.enum(SOCIAL_CONNECTION_STATUSES);
export const mediaKindSchema = z.enum(MEDIA_KINDS);
export const contentOriginSchema = z.enum(CONTENT_ORIGINS);
export const contentProcessingStatusSchema = z.enum(
	CONTENT_PROCESSING_STATUSES,
);
export const xPostTypeSchema = z.enum(X_POST_TYPES);
export const draftTargetKindSchema = z.enum(X_TARGET_KINDS);
export const publicationStatusSchema = z.enum(PUBLICATION_STATUSES);
export const publicationFailureReasonSchema = z.enum(
	PUBLICATION_FAILURE_REASONS,
);
export const aiOperationSchema = z.enum(AI_OPERATIONS);
export const aiGenerationStatusSchema = z.enum(AI_GENERATION_STATUSES);
export const researchStatusSchema = z.enum(RESEARCH_STATUSES);
export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);
export const notificationEmailStatusSchema = z.enum(
	NOTIFICATION_EMAIL_STATUSES,
);

// ─── Pure Zod (no DB enum) ────────────────────────────────────────────────────

export const publicationModeSchema = z.enum(["now", "schedule"]);
export type PublicationMode = z.infer<typeof publicationModeSchema>;
