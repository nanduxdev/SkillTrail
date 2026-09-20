import { withApiHandler } from "../../../../../lib/api/handler";
import { listTechnologies } from "../../../../../lib/domain/profile";

export async function GET(request: Request) {
	return withApiHandler(request, async () => {
		const items = await listTechnologies();
		return { items };
	});
}
