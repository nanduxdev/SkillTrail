import { z } from "zod";

export const ExperienceLevelSchema = z.enum([
	"student",
	"junior",
	"mid_level",
	"senior",
]);

export const PlatformSchema = z.enum(["linkedin", "x"]);

export const WritingToneSchema = z.enum(["casual", "balanced", "formal"]);

export const TechnicalDepthSchema = z.enum([
	"beginner_friendly",
	"detailed",
	"expert",
]);

export const EmojiUsageSchema = z.enum(["none", "minimal", "frequent"]);

export const UpdateProfileInput = z.object({
	experienceLevel: ExperienceLevelSchema.nullable().optional(),
	preferredPlatforms: z.array(PlatformSchema).optional(),
	writingTone: WritingToneSchema.nullable().optional(),
	technicalDepth: TechnicalDepthSchema.nullable().optional(),
	emojiUsage: EmojiUsageSchema.nullable().optional(),
	writingInstruction: z.string().max(1000).nullable().optional(),
	technologyIds: z.array(z.string().uuid()).optional(),
	interestIds: z.array(z.string().uuid()).optional(),
});

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInput>;
