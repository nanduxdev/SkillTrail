import { getProfileWithRelations } from "@/lib/domain/profile";

export async function getProfile(userId: string) {
	return getProfileWithRelations(userId);
}
