import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { draft } from "./composition";
import { xThreadPost } from "./x";
import { aiGenerationStatusEnum, aiOperationEnum } from "./enums";

// Persisted AI proposal/version history, scoped to Draft (Schema Spec
// §2.10). One table covers the entire review/undo/compare/restore lifecycle
// via `status` + the two pointer columns on `draft`
// (pendingAiGenerationId / currentAiGenerationId) — no separate proposal
// table. Content-level operations (understandContent, generateAngles) are
// NOT rows here; they populate content.understandingResult and `angle`
// directly, since accept/reject/undo semantics don't apply to them.
export const aiGeneration = pgTable(
	"ai_generation",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		draftId: uuid("draft_id")
			.notNull()
			.references(() => draft.id, { onDelete: "cascade" }),
		// Scopes a thread-level operation to one item vs. the whole draft.
		// SET NULL (not cascade) so draft-level AI history survives even if the
		// specific thread-post row is later removed by the user.
		targetXThreadPostId: uuid("target_x_thread_post_id").references(
			() => xThreadPost.id,
			{ onDelete: "set null" },
		),

		operation: aiOperationEnum("operation").notNull(),
		status: aiGenerationStatusEnum("status").notNull().default("pending"),

		// The natural-language edit instruction, e.g. "make it more casual".
		// Null for a plain generate/regenerate with no specific instruction.
		instruction: text("instruction"),
		// Null for the very first generation (no prior state to diff against).
		beforeText: text("before_text"),
		afterText: text("after_text").notNull(),

		provider: text("provider").notNull(),
		model: text("model").notNull(),
		latencyMs: integer("latency_ms"),
		promptTokens: integer("prompt_tokens"),
		completionTokens: integer("completion_tokens"),
		errorMessage: text("error_message"),

		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		resolvedAt: timestamp("resolved_at", { withTimezone: true }),
	},
	(t) => [index("ai_generation_draft_created_idx").on(t.draftId, t.createdAt)],
);
