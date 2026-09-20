export type ApiSuccess<T> = {
	success: true;
	data: T;
	meta?: Record<string, unknown>;
};

export type ApiFailure = {
	success: false;
	error: {
		code: string;
		message: string;
		fieldErrors?: Record<string, string[]>;
		details?: unknown;
	};
	meta?: Record<string, unknown>;
};
