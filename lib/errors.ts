export type AppErrorCode =
	| "BAD_REQUEST"
	| "UNAUTHENTICATED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "VALIDATION_ERROR"
	| "CONFLICT"
	| "AI_PROPOSAL_PENDING"
	| "RATE_LIMITED"
	| "PROVIDER_ERROR"
	| "INTERNAL_ERROR"
	| "SERVICE_UNAVAILABLE";

export class AppError extends Error {
	constructor(
		public readonly code: AppErrorCode,
		message: string,
		public readonly details?: unknown,
		public readonly fieldErrors?: Record<string, string[]>,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export const badRequest = (message: string, details?: unknown) =>
	new AppError("BAD_REQUEST", message, details);

export const unauthenticated = (message = "Sign in required.") =>
	new AppError("UNAUTHENTICATED", message);

export const forbidden = (message = "Not allowed.", details?: unknown) =>
	new AppError("FORBIDDEN", message, details);

export const notFound = (message = "Resource not found.", details?: unknown) =>
	new AppError("NOT_FOUND", message, details);

export const conflict = (message: string, details?: unknown) =>
	new AppError("CONFLICT", message, details);

export const aiProposalPending = () =>
	new AppError(
		"AI_PROPOSAL_PENDING",
		"This draft has a pending AI proposal. Accept or reject it before editing.",
	);

export const validationError = (
	message: string,
	fieldErrors?: Record<string, string[]>,
	details?: unknown,
) => new AppError("VALIDATION_ERROR", message, details, fieldErrors);

export const rateLimited = (
	message = "Rate limit exceeded.",
	details?: unknown,
) => new AppError("RATE_LIMITED", message, details);

export const providerError = (message: string, details?: unknown) =>
	new AppError("PROVIDER_ERROR", message, details);

export const serviceUnavailable = (
	message = "Temporarily unavailable.",
	details?: unknown,
) => new AppError("SERVICE_UNAVAILABLE", message, details);

export const internalError = (
	message = "Something went wrong.",
	details?: unknown,
) => new AppError("INTERNAL_ERROR", message, details);
