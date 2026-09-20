import { NextResponse } from "next/server";
import { AppError, internalError } from "./errors";
import { ApiFailure, ApiSuccess } from "./types";

export function success<T>(
	data: T,
	meta?: Record<string, unknown>,
): NextResponse<ApiSuccess<T>> {
	return NextResponse.json(
		{
			success: true,
			data,
			meta,
		},
		{ status: 200 },
	);
}

export function error(
	err: AppError | Error,
	meta?: Record<string, unknown>,
): NextResponse<ApiFailure> {
	let appError: AppError;

	if (err instanceof AppError) {
		appError = err;
	} else {
		// Map unknown errors to generic 500
		appError = internalError("An unexpected error occurred", {
			originalMessage: err.message,
		});
	}

	return NextResponse.json(
		{
			success: false,
			error: {
				code: appError.code,
				message: appError.message,
				...(appError.fieldErrors ? { fieldErrors: appError.fieldErrors } : {}),
				...(appError.details ? { details: appError.details } : {}),
			},
			meta,
		},
		{ status: appError.status },
	);
}
