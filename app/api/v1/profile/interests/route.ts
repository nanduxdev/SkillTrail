import { withApiHandler } from "../../../../../lib/api/handler";
import { listInterests } from "../../../../../lib/domain/profile";

export async function GET(request: Request) {
	return withApiHandler(request, async () => {
		const items = await listInterests();
		return { items };
	});
}
