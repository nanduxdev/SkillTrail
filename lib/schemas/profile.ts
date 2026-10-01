import { z } from "zod";
import {
	emojiUsageSchema,
	experienceLevelSchema,
	platformSchema,
	technicalDepthSchema,
	writingToneSchema,
} from "./enums";

export const ExperienceLevelSchema = experienceLevelSchema;
export const PlatformSchema = platformSchema;
export const WritingToneSchema = writingToneSchema;
export const TechnicalDepthSchema = technicalDepthSchema;
export const EmojiUsageSchema = emojiUsageSchema;

export const UpdateProfileInput = z.object({
	experienceLevel: experienceLevelSchema.nullable().optional(),
	preferredPlatforms: z.array(platformSchema).optional(),
	writingTone: writingToneSchema.nullable().optional(),
	technicalDepth: technicalDepthSchema.nullable().optional(),
	emojiUsage: emojiUsageSchema.nullable().optional(),
	writingInstruction: z.string().max(1000).nullable().optional(),
	technologyIds: z.array(z.string().uuid()).optional(),
	interestIds: z.array(z.string().uuid()).optional(),
});

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInput>;

export const catalogSearchInput = z.object({
	query: z.string().optional(),
});
