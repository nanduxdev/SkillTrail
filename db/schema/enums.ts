import { pgEnum } from "drizzle-orm/pg-core";

// Shared platform enum — used across social_connection, draft, publication.
export const platformEnum = pgEnum("platform", ["linkedin", "x"]);

export const experienceLevelEnum = pgEnum("experience_level", [
	"student",
	"junior",
	"mid_level",
	"senior",
]);

// [ASSUMPTION] label sets — not locked upstream, confirm before shipping onboarding copy.
export const writingToneEnum = pgEnum("writing_tone", [
	"casual",
	"balanced",
	"formal",
]);

export const technicalDepthEnum = pgEnum("technical_depth", [
	"beginner_friendly",
	"detailed",
	"expert",
]);

export const emojiUsageEnum = pgEnum("emoji_usage", [
	"none",
	"minimal",
	"frequent",
]);

export const socialConnectionStatusEnum = pgEnum("social_connection_status", [
	"connected",
	"disconnected",
	"expired",
	"revoked",
]);

export const mediaKindEnum = pgEnum("media_kind", ["image", "document"]);

export const contentOriginEnum = pgEnum("content_origin", [
	"manual",
	"research",
	"discovery",
]);

// [ASSUMPTION] see SkillTrail-Schema-Spec-v1.0.md §2.4 — not an upstream-locked entity/state.
export const contentProcessingStatusEnum = pgEnum("content_processing_status", [
	"raw",
	"analyzing",
	"understood",
	"failed",
]);

export const xPostTypeEnum = pgEnum("x_post_type", [
	"standalone",
	"reply",
	"self_reply",
	"thread",
	"quote",
]);

export const xTargetKindEnum = pgEnum("x_target_kind", [
	"external",
	"own_publication",
]);

export const publicationStatusEnum = pgEnum("publication_status", [
	"scheduled",
	"publishing",
	"published",
	"publish_failed",
	"cancelled",
	"deleted",
	"delete_failed",
]);

export const publicationFailureReasonEnum = pgEnum(
	"publication_failure_reason",
	[
		"account_disconnected",
		"platform_error",
		"rate_limited",
		"validation_error",
		"unknown",
	],
);

export const aiOperationEnum = pgEnum("ai_operation", [
	"generate_draft",
	"edit_draft",
	"regenerate",
	"restore",
]);

export const aiGenerationStatusEnum = pgEnum("ai_generation_status", [
	"pending",
	"accepted",
	"rejected",
	"failed",
]);

export const researchStatusEnum = pgEnum("research_status", [
	"running",
	"completed",
	"failed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"consistency_reminder",
]);

export const notificationEmailStatusEnum = pgEnum("notification_email_status", [
	"not_applicable",
	"sent",
	"failed",
]);
