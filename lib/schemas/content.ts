import { z } from "zod";
import { contentOriginSchema } from "./enums";

// ─── createContent ───────────────────────────────────────────────────────────

export const CreateContentInput = z.object({
	rawText: z.string().nullable().optional(),
	origin: contentOriginSchema.default("manual"),
	researchId: z.string().uuid().nullable().optional(),
	discoveryItemId: z.string().uuid().nullable().optional(),
	contextMedia: z
		.array(
			z.object({
				mediaId: z.string().uuid(),
				note: z.string().nullable().optional(),
			}),
		)
		.optional(),
});

export type CreateContentInputType = z.infer<typeof CreateContentInput>;

// ─── updateContent ───────────────────────────────────────────────────────────

export const UpdateContentInput = z.object({
	rawText: z.string().nullable().optional(),
	origin: contentOriginSchema.optional(),
});

export type UpdateContentInputType = z.infer<typeof UpdateContentInput>;

// ─── addContextMedia ─────────────────────────────────────────────────────────

export const AddContextMediaInput = z.object({
	mediaId: z.string().uuid(),
	note: z.string().nullable().optional(),
});

export type AddContextMediaInputType = z.infer<typeof AddContextMediaInput>;
