import { eq } from "drizzle-orm";
import { db } from "../../db";
import { earlyAccess } from "../../db/schema/early-access";

function isPostgresUniqueViolation(error: unknown): boolean {
	if (typeof error !== "object" || error === null) return false;
	const record = error as { code?: unknown; cause?: unknown };
	if (record.code === "23505") return true;
	if (
		typeof record.cause === "object" &&
		record.cause !== null &&
		(record.cause as { code?: unknown }).code === "23505"
	) {
		return true;
	}
	return false;
}

export async function emailExists(email: string): Promise<boolean> {
	const [row] = await db
		.select({ id: earlyAccess.id })
		.from(earlyAccess)
		.where(eq(earlyAccess.email, email))
		.limit(1);

	return Boolean(row);
}

export async function join(email: string): Promise<void> {
	try {
		await db.insert(earlyAccess).values({ email });
	} catch (error) {
		if (isPostgresUniqueViolation(error)) {
			throw Object.assign(new Error("EARLY_ACCESS_ALREADY_REGISTERED"), {
				code: "EARLY_ACCESS_ALREADY_REGISTERED",
			});
		}
		throw error;
	}
}

export { isPostgresUniqueViolation };
