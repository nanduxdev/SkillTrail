import { z } from "zod";
import { validationError } from "./errors";

export async function validateBody<T extends z.ZodType>(
	request: Request,
	schema: T,
): Promise<z.infer<T>> {
	let json: unknown;

	try {
		json = await request.json();
	} catch {
		throw validationError("Malformed JSON");
	}

	const result = schema.safeParse(json);

	if (!result.success) {
		const fieldErrors = z.flattenError(result.error).fieldErrors as Record<
			string,
			string[]
		>;

		throw validationError("Invalid request body", fieldErrors);
	}

	return result.data;
}

export function validateQuery<T extends z.ZodType>(
	request: Request,
	schema: T,
): z.infer<T> {
	const url = new URL(request.url);
	const query = Object.fromEntries(url.searchParams.entries());

	const result = schema.safeParse(query);

	if (!result.success) {
		const fieldErrors = z.flattenError(result.error).fieldErrors as Record<
			string,
			string[]
		>;
		throw validationError("Invalid query parameters", fieldErrors);
	}

	return result.data;
}
