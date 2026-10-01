import { pgEnum } from "drizzle-orm/pg-core";
import {
	AI_GENERATION_STATUSES,
	AI_OPERATIONS,
	CONTENT_ORIGINS,
	CONTENT_PROCESSING_STATUSES,
	EMOJI_USAGES,
	EXPERIENCE_LEVELS,
	MEDIA_KINDS,
	NOTIFICATION_EMAIL_STATUSES,
	NOTIFICATION_TYPES,
	PLATFORMS,
	PUBLICATION_FAILURE_REASONS,
	PUBLICATION_STATUSES,
	RESEARCH_STATUSES,
	SOCIAL_CONNECTION_STATUSES,
	TECHNICAL_DEPTHS,
	WRITING_TONES,
	X_POST_TYPES,
	X_TARGET_KINDS,
} from "../../lib/schemas/enums";

// Shared platform enum — used across social_connection, draft, publication.
export const platformEnum = pgEnum("platform", PLATFORMS);

export const experienceLevelEnum = pgEnum(
	"experience_level",
	EXPERIENCE_LEVELS,
);

// Finalized label sets — locked in docs/product.md.
export const writingToneEnum = pgEnum("writing_tone", WRITING_TONES);

export const technicalDepthEnum = pgEnum("technical_depth", TECHNICAL_DEPTHS);

export const emojiUsageEnum = pgEnum("emoji_usage", EMOJI_USAGES);

export const socialConnectionStatusEnum = pgEnum(
	"social_connection_status",
	SOCIAL_CONNECTION_STATUSES,
);

export const mediaKindEnum = pgEnum("media_kind", MEDIA_KINDS);

export const contentOriginEnum = pgEnum("content_origin", CONTENT_ORIGINS);

export const contentProcessingStatusEnum = pgEnum(
	"content_processing_status",
	CONTENT_PROCESSING_STATUSES,
);

export const xPostTypeEnum = pgEnum("x_post_type", X_POST_TYPES);

export const xTargetKindEnum = pgEnum("x_target_kind", X_TARGET_KINDS);

export const publicationStatusEnum = pgEnum(
	"publication_status",
	PUBLICATION_STATUSES,
);

export const publicationFailureReasonEnum = pgEnum(
	"publication_failure_reason",
	PUBLICATION_FAILURE_REASONS,
);

export const aiOperationEnum = pgEnum("ai_operation", AI_OPERATIONS);

export const aiGenerationStatusEnum = pgEnum(
	"ai_generation_status",
	AI_GENERATION_STATUSES,
);

export const researchStatusEnum = pgEnum("research_status", RESEARCH_STATUSES);

export const notificationTypeEnum = pgEnum(
	"notification_type",
	NOTIFICATION_TYPES,
);

export const notificationEmailStatusEnum = pgEnum(
	"notification_email_status",
	NOTIFICATION_EMAIL_STATUSES,
);
