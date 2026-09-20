import { withApiHandler } from "../../../../lib/api/handler";
import { validateBody } from "../../../../lib/api/validation";
import {
	getProfileWithRelations,
	updateProfile,
} from "../../../../lib/domain/profile";
import { UpdateProfileInput } from "../../../../lib/schemas/profile";

export async function GET(request: Request) {
	return withApiHandler(request, async ({ user }) => {
		return getProfileWithRelations(user.id);
	});
}

export async function PATCH(request: Request) {
	return withApiHandler(request, async ({ user }) => {
		const input = await validateBody(request, UpdateProfileInput);
		return updateProfile(user.id, input);
	});
}
