"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import {
	AddContextMediaInput,
	CreateContentInput,
	UpdateContentInput,
} from "@/lib/schemas/content";
import * as contentService from "@/lib/domain/content-service";

// ─── R1 — createContent ──────────────────────────────────────────────────────

export const createContent = authActionClient
	.inputSchema(CreateContentInput)
	.action(async ({ parsedInput, ctx }) => {
		return contentService.create(ctx.auth.user.id, parsedInput);
	});

// ─── R2 — updateContent ──────────────────────────────────────────────────────

export const updateContent = authActionClient
	.bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
	.inputSchema(UpdateContentInput)
	.action(async ({ parsedInput, bindArgsParsedInputs: [contentId], ctx }) => {
		return contentService.update(ctx.auth.user.id, contentId, parsedInput);
	});

// ─── R3 — deleteContent ──────────────────────────────────────────────────────

export const deleteContent = authActionClient
	.bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
	.action(async ({ bindArgsParsedInputs: [contentId], ctx }) => {
		return contentService.deleteContent(ctx.auth.user.id, contentId);
	});

// ─── R5 — addContextMedia ────────────────────────────────────────────────────

export const addContextMedia = authActionClient
	.bindArgsSchemas<[contentId: z.ZodString]>([z.string().uuid()])
	.inputSchema(AddContextMediaInput)
	.action(async ({ parsedInput, bindArgsParsedInputs: [contentId], ctx }) => {
		return contentService.addContextMedia(
			ctx.auth.user.id,
			contentId,
			parsedInput,
		);
	});

// ─── R6 — removeContextMedia ─────────────────────────────────────────────────

export const removeContextMedia = authActionClient
	.bindArgsSchemas<[contentId: z.ZodString, mediaId: z.ZodString]>([
		z.string().uuid(),
		z.string().uuid(),
	])
	.action(async ({ bindArgsParsedInputs: [contentId, mediaId], ctx }) => {
		return contentService.removeContextMedia(
			ctx.auth.user.id,
			contentId,
			mediaId,
		);
	});
