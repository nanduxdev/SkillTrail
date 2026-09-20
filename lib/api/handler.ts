import { NextResponse } from "next/server";
import { auth } from "../auth";
import { error, success } from "./response";
import { unauthenticated, type AppError } from "./errors";
import type { Session, User } from "better-auth";

export interface ApiContext {
	session: Session;
	user: User;
}

// export interface ApiHandlerConfig {
//   isPublic?: boolean;
// }

export async function withApiHandler(
	request: Request,
	handler: (ctx: ApiContext) => Promise<unknown>,
): Promise<NextResponse> {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || !session.session || !session.user) {
			throw unauthenticated();
		}

		const data = await handler({
			session: session.session,
			user: session.user,
		});

		return success(data);
	} catch (err) {
		return error(err as AppError);
	}
}
