import { notFound as appNotFound } from "@/lib/errors";
import * as contentService from "@/lib/domain/content-service";
import { notFound } from "next/navigation";

export type {
	ContentSummary,
	ContentWithRelations,
	ContentListResult,
} from "@/lib/domain/content-service";

/**
 * Data-access function for Server Components — NOT a Server Action.
 * Returns a paginated list of the caller's content items.
 */
export async function getContentList(
	userId: string,
	options: { limit?: number; cursor?: string } = {},
) {
	return contentService.getList(userId, options);
}

/**
 * Data-access function for Server Components — NOT a Server Action.
 * Returns full content detail with angles and compositions.
 * Calls Next.js notFound() on AppError("NOT_FOUND") so the nearest
 * not-found.tsx boundary renders automatically.
 */
export async function getContent(userId: string, contentId: string) {
	try {
		return await contentService.getOne(userId, contentId);
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			(error as { code: string }).code === "NOT_FOUND"
		) {
			notFound();
		}
		throw error;
	}
}
