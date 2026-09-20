export const ErrorCodes = {
	BAD_REQUEST: "BAD_REQUEST",
	UNAUTHENTICATED: "UNAUTHENTICATED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	CONFLICT: "CONFLICT",
	RATE_LIMITED: "RATE_LIMITED",
	PROVIDER_ERROR: "PROVIDER_ERROR",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export class AppError extends Error {
	constructor(
		public readonly code: string,
		public readonly status: number,
		message: string,
		public readonly details?: unknown,
		public readonly fieldErrors?: Record<string, string[]>,
	) {
		super(message);
		this.name = "AppError";
	}
}

export function badRequest(message: string, details?: unknown) {
	return new AppError(ErrorCodes.BAD_REQUEST, 400, message, details);
}

export function unauthenticated(message = "Unauthenticated") {
	return new AppError(ErrorCodes.UNAUTHENTICATED, 401, message);
}

export function forbidden(message = "Forbidden", details?: unknown) {
	return new AppError(ErrorCodes.FORBIDDEN, 403, message, details);
}

export function notFound(message = "Not found", details?: unknown) {
	return new AppError(ErrorCodes.NOT_FOUND, 404, message, details);
}

export function conflict(message: string, details?: unknown) {
	return new AppError(ErrorCodes.CONFLICT, 409, message, details);
}

export function validationError(
	message: string,
	fieldErrors?: Record<string, string[]>,
	details?: unknown,
) {
	return new AppError(
		ErrorCodes.VALIDATION_ERROR,
		422,
		message,
		details,
		fieldErrors,
	);
}

export function rateLimited(message = "Rate limited", details?: unknown) {
	return new AppError(ErrorCodes.RATE_LIMITED, 429, message, details);
}

export function providerError(message: string, details?: unknown) {
	return new AppError(ErrorCodes.PROVIDER_ERROR, 502, message, details);
}

export function internalError(message = "Internal error", details?: unknown) {
	return new AppError(ErrorCodes.INTERNAL_ERROR, 500, message, details);
}
