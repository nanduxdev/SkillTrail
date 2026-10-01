# SkillTrail Server Actions Contract (v2)

> **Status:** V2 contract — supersedes the uploaded v1 `api-contract.md`.
> **Source of truth:** the uploaded Drizzle schema equivalent, `relations.ts`, and the SkillTrail domain/product/architecture/design documents.
> **Validation/execution library:** [`next-safe-action`](https://next-safe-action.dev) (v7, Standard Schema-based). Docs were read live for this rewrite since the library has shipped breaking changes (Standard Schema replacing TypeSchema, `inputSchema()` replacing `schema()`, the middleware-chaining rewrite, the first-party Better Auth adapter) since general model training data.

## 0. What changed from v1, and why

Three unknowns from the previous review are now resolved, and they simplify this contract considerably:

| Unknown                                                              | Resolution                                         | Effect                                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Will the landing page/early-access form ever leave this Next.js app? | **No, it stays here permanently.**                 | `POST /api/v1/early-access` → Server Action.                                                              |
| Is a mobile app or third-party API consumer planned?                 | **No, not for V1 or beyond, as currently scoped.** | Removes the main reason to keep a stable public HTTP contract. Almost everything becomes a Server Action. |
| Is streamed (token-by-token) AI output wanted?                       | **No.**                                            | `POST /drafts/:id/ai/generate` and `.../ai/edit` → Server Actions, not streaming Route Handlers.          |

**PROJECT FACT (as clarified in this conversation):** the three rows above.
**RECOMMENDATION (this document):** everything else — the specific choice of Server Action vs. Route Handler per call, the `next-safe-action` client shape, the error-code mapping, the bind-argument pattern. None of this is established by the supplied project documents; it is this document's proposal for implementing them.

Given the three facts above, only **three** calls in the entire contract remain Route Handlers. Every other mutation, and every read that's driven by client-side interactivity (search, pagination, polling), is now a `next-safe-action` Server Action. Reads that only serve an initial page load are not endpoints at all — they're plain data-access functions called directly from Server Components.

---

## 1. Conventions (carried over from v1)

- **IDs:** schema IDs are UUIDs.
- **Timestamps:** ISO-8601 UTC strings in any data returned to the client, e.g. `2026-09-19T12:34:56.000Z`.
- **Pagination:** cursor-based. Read functions/actions accept `{ limit, cursor }` and return `{ items, nextCursor }`. `limit` is capped server-side (default 20, max 50 unless noted).
- **Binary media:** still never sent through an action body. The client uploads directly to Cloudflare R2 using a presigned URL obtained from `createMediaUploadIntent` (§16). This is unchanged from v1 and is actually a _better_ fit for Server Actions, which — like Route Handlers — should not carry large binary payloads.

The base path `/api/v1` and Better Auth's ownership of `/api/v1/auth/*` still apply, but now describe a much smaller surface: Better Auth's own routes, plus the three Route Handlers in §7.

---

## 2. The action result model (replaces the old `ApiSuccess`/`ApiFailure` envelope)

`next-safe-action` does not use HTTP status codes — a Server Action is a function call, not an HTTP response. Every action call returns a single, always-shaped result object instead:

```ts
type SafeActionResult<ServerError, Schema, Data> = {
	data?: Data;
	validationErrors?: ValidationErrors<Schema>; // shape controlled by defaultValidationErrorsShape
	serverError?: ServerError; // our AppServerError, see §3
};
```

This **is** the v2 replacement for `ApiSuccess<T>` / `ApiFailure`. There are three channels instead of a `success` boolean:

| Old (v1)                                                                           | New (v2)                                              | When                                                                                                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `success: true, data`                                                              | `result.data` present                                 | Happy path                                                                                                                                          |
| `success: false, error.fieldErrors` (422)                                          | `result.validationErrors`                             | A field failed Zod validation, or a business rule tied to a specific field was reported via `returnValidationErrors()` (e.g. "email already taken") |
| `success: false, error.code/message/details` (400/401/403/404/409/429/500/502/503) | `result.serverError` (our `AppServerError` shape, §3) | Any domain/infrastructure error not tied to one input field                                                                                         |

The client is expected to check `result.validationErrors` and `result.serverError` explicitly — TypeScript narrows both away once `result.data` is checked, exactly like the old `success` discriminant did.

---

## 3. Shared infrastructure — the `withApiHandler` equivalent

The v1 contract centralized error handling in `lib/api/{errors,handler,response,validation}.ts`. In v2, `handler.ts` and `response.ts` are no longer needed — `createSafeActionClient()` **is** that wrapper, provided by the library. `errors.ts` is kept almost unchanged, because the domain layer must keep throwing the same typed errors regardless of which adapter (Server Action or the 2 remaining Route Handlers) calls it.

### 3.1 `lib/errors.ts` (unchanged in spirit, HTTP status dropped)

```ts
// lib/errors.ts

export type AppErrorCode =
	| "BAD_REQUEST"
	| "UNAUTHENTICATED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "AI_PROPOSAL_PENDING" // specific, client-distinguishable case of CONFLICT — see domain.md INVARIANT-AI-004/011
	| "RATE_LIMITED"
	| "PROVIDER_ERROR"
	| "INTERNAL_ERROR"
	| "SERVICE_UNAVAILABLE";

export class AppError extends Error {
	constructor(
		public readonly code: AppErrorCode,
		message: string,
		public readonly details?: unknown,
	) {
		super(message);
		this.name = "AppError";
	}
}

export const notFound = (message = "Resource not found.") =>
	new AppError("NOT_FOUND", message);

export const conflict = (message: string, details?: unknown) =>
	new AppError("CONFLICT", message, details);

export const aiProposalPending = () =>
	new AppError(
		"AI_PROPOSAL_PENDING",
		"This draft has a pending AI proposal. Accept or reject it before editing.",
	);

export const forbidden = (message = "Not allowed.") =>
	new AppError("FORBIDDEN", message);

export const badRequest = (message: string) =>
	new AppError("BAD_REQUEST", message);

export const rateLimited = (message = "Rate limit exceeded.") =>
	new AppError("RATE_LIMITED", message);

export const providerError = (message: string, details?: unknown) =>
	new AppError("PROVIDER_ERROR", message, details);

export const serviceUnavailable = (message = "Temporarily unavailable.") =>
	new AppError("SERVICE_UNAVAILABLE", message);
```

`NOT_FOUND` is still how ownership failures are represented (domain.md: unauthorized resources return 404-equivalent, never `FORBIDDEN`, never leaking existence). Domain services throw `notFound()` the same way whether they're called from a Server Action or from one of the two remaining Route Handlers — **this is the whole point of keeping business logic in the domain layer**, per `CLAUDE.md`'s rule that logic must not be duplicated between entry points.

### 3.2 `lib/safe-action.ts` — the actual `withServerAction` wrapper

This file is the direct v2 equivalent of `lib/api/handler.ts`'s `withApiHandler`. Instead of a function you call inside a route, it's a **client** you chain methods onto — that's the `next-safe-action` pattern.

```ts
// lib/safe-action.ts
import { createSafeActionClient } from "next-safe-action";
import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { auth } from "@/lib/auth"; // your existing Better Auth server instance
import { AppError, type AppErrorCode } from "@/lib/errors";

export type AppServerError = {
	code: AppErrorCode;
	message: string;
	details?: unknown;
};

/**
 * Base client. No auth. Use only for genuinely public actions
 * (currently: joinEarlyAccess — see §24).
 */
export const actionClient = createSafeActionClient<AppServerError>({
	// Mirrors the old fieldErrors: Record<string, string[]> shape from v1's
	// ApiFailure, so client code that already expects "one array of messages
	// per field" doesn't have to change when a validation error crosses over
	// from a route to an action.
	defaultValidationErrorsShape: "flattened",

	handleServerError(e) {
		if (e instanceof AppError) {
			return { code: e.code, message: e.message, details: e.details };
		}
		// Unknown/unexpected error: never leak internals, per domain.md's
		// "social tokens/credentials never reach client code" spirit and the
		// v1 contract's "never expose stack traces" rule.
		console.error("Unhandled Server Action error:", e);
		return { code: "INTERNAL_ERROR", message: "Something went wrong." };
	},
});

/**
 * Authenticated client. Every action in §8 onward except joinEarlyAccess
 * is built on this. ctx.auth.user and ctx.auth.session are typed by the
 * adapter from your actual Better Auth instance/plugins.
 */
export const authActionClient = actionClient.use(
	betterAuth(auth, {
		// RECOMMENDATION: throw through the same AppServerError channel as
		// every other domain error, instead of the adapter's default
		// unauthorized() framework navigation. This avoids depending on
		// Next's experimental `authInterrupts` flag and keeps the client
		// with exactly one place to look for errors (result.serverError.code),
		// matching the v1 contract's UNAUTHENTICATED code.
		//
		// Alternative (not used here): omit `authorize` entirely to get the
		// adapter's default behavior, which calls unauthorized() from
		// next/navigation and requires
		// `experimental: { authInterrupts: true }` in next.config.ts. That
		// renders your nearest unauthorized.tsx boundary instead of
		// returning a result — a reasonable choice too, just a different
		// one, and one this contract does not assume.
		authorize: ({ authData, next }) => {
			if (!authData) {
				throw new AppError("UNAUTHENTICATED", "Sign in required.");
			}
			return next({ ctx: { auth: authData } });
		},
	}),
);
```

**Dependencies to add** (none of this touches the locked stack's database/framework/CSS choices — it's a validation/execution library, same category as Zod, which is already locked):

```bash
bun add next-safe-action @next-safe-action/adapter-better-auth
```

(`zod` is already part of the locked stack.)

### 3.3 `lib/schemas/enums.ts` — shared Zod enums

Centralizing these avoids re-typing the same `z.enum([...])` in a dozen action files, and keeps them in sync with the locked enum values in `product.md`'s "Finalized Decisions" section.

```ts
// lib/schemas/enums.ts
import { z } from "zod";

export const platformSchema = z.enum(["linkedin", "x"]);

export const experienceLevelSchema = z.enum([
	"student",
	"junior",
	"mid_level",
	"senior",
]);

export const writingToneSchema = z.enum(["casual", "balanced", "formal"]);
export const technicalDepthSchema = z.enum([
	"beginner_friendly",
	"detailed",
	"expert",
]);
export const emojiUsageSchema = z.enum(["none", "minimal", "frequent"]);

export const xPostTypeSchema = z.enum([
	"standalone",
	"reply",
	"self_reply",
	"thread",
	"quote",
]);
export const draftTargetKindSchema = z.enum(["external", "own_publication"]);

export const mediaKindSchema = z.enum(["image", "document"]);

export const publicationModeSchema = z.enum(["now", "schedule"]);
```

---

## 4. Authentication

Unchanged fact from `architecture.md`/`better-auth drizzle.md`: Better Auth still owns `/api/v1/auth/*` as actual HTTP routes (sign-in, sign-up, session, OAuth-for-login) — that surface is Better Auth's own Route Handler, generated by its own tooling, and is untouched by this document.

What's new: `authActionClient` (§3.2) is how every _application_ action gets `ctx.auth.user`/`ctx.auth.session`, fully typed from your Better Auth instance including any plugin fields, without hand-rolling a session check in every action (the v1 contract's `withApiHandler` did this manually; the official adapter now does it).

**Required config addition** (RECOMMENDATION, only needed if you use the default `unauthorized()` behavior instead of the `authorize` override in §3.2):

```ts
// next.config.ts
export default {
	experimental: { authInterrupts: true },
};
```

Not needed with the `authorize` override shown above, since it throws a normal error instead of calling `unauthorized()`.

---

## 5. Ownership pattern: bind arguments + domain-layer checks

`domain.md`/`architecture.md`'s rule stands unchanged: **every resource-by-ID action re-derives ownership from the session, and a resource that exists but isn't owned by the caller returns `NOT_FOUND`, never `FORBIDDEN`.** What changes is _where the ID comes from_ and _where the check lives_.

### 5.1 Resource IDs are bind arguments, not input fields

`next-safe-action`'s `bindArgsSchemas()` is the documented, recommended pattern for exactly this case: a value that's already known server-side (from the URL/route params in the Server Component that renders the page) gets bound to the action before the client ever calls it, instead of being smuggled through the input object where the client would otherwise need to "assert" it.

```ts
// app/drafts/[draftId]/page.tsx  (Server Component)
import { updateDraft } from "@/features/draft/actions";

export default async function DraftPage({ params }: { params: { draftId: string } }) {
	const boundUpdateDraft = updateDraft.bind(null, params.draftId);
	return <DraftEditor action={boundUpdateDraft} />;
}
```

```tsx
// features/draft/draft-editor.tsx (Client Component)
"use client";
import { useAction } from "next-safe-action/hooks";
import type { updateDraft } from "./actions";

export function DraftEditor({ action }: { action: typeof updateDraft }) {
	const { execute, result, isPending } = useAction(action);
	// execute({ bodyText: "..." }) — draftId is already bound, the client
	// never sends it as part of the editable payload.
}
```

### 5.2 The ownership check itself lives in the domain service, not in middleware

Every resource has a different FK chain to `userId` (Content → Composition → Draft → AiGeneration, vs. Media, vs. Publication, etc.), so a single generic ownership middleware can't express all of them without duplicating knowledge the domain layer already has. Per `CLAUDE.md`'s domain-layer rule, that knowledge belongs in one place:

```ts
// domain/draft-service.ts
export async function updateDraft(
	userId: string,
	draftId: string,
	patch: DraftPatch,
) {
	const draft = await db.query.draft.findFirst({
		where: eq(draftTable.id, draftId) /* + owner join */,
	});
	if (!draft || draft.ownerId !== userId) throw notFound(); // never FORBIDDEN
	if (draft.pendingAiGenerationId) throw aiProposalPending(); // INVARIANT-AI-004
	// ...update...
}
```

The action itself stays a thin adapter:

```ts
// features/draft/actions.ts
"use server";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { draftTargetKindSchema, xPostTypeSchema } from "@/lib/schemas/enums";
import * as draftService from "@/domain/draft-service";

export const updateDraft = authActionClient
	.bindArgsSchemas<[draftId: z.ZodString]>([z.string().uuid()])
	.inputSchema(
		z.object({
			bodyText: z.string().nullable().optional(),
			xPostType: xPostTypeSchema.optional(),
			targetKind: draftTargetKindSchema.nullable().optional(),
			targetExternalPostId: z.string().uuid().nullable().optional(),
			targetPublicationId: z.string().uuid().nullable().optional(),
		}),
	)
	.action(async ({ parsedInput, bindArgsParsedInputs: [draftId], ctx }) => {
		const draft = await draftService.updateDraft(
			ctx.auth.user.id,
			draftId,
			parsedInput,
		);
		return { draft };
	});
```

This single worked example is the template every mutation in §9 onward follows: `bindArgsSchemas` for the resource path, `inputSchema` for the editable payload, a domain-service call inside `.action()`, `AppError` subclasses thrown from the domain layer and caught centrally by `handleServerError`.

To keep the rest of this document readable, later sections give the **input schema, bind args, return shape, and possible `serverError.code` values** for each action, and only show full server code where a pattern hasn't already been established (business-rule validation errors, Trigger.dev enqueueing, the OAuth pair).

---

## 6. File/folder conventions

```text
lib/
  safe-action.ts       # actionClient, authActionClient (§3.2)
  errors.ts            # AppError + helpers (§3.1)
  schemas/
    enums.ts           # shared Zod enums (§3.3)
domain/
  <resource>-service.ts  # one per aggregate root: content, composition,
                          # draft, ai-generation, media, publication,
                          # social-connection, research, discovery,
                          # notification, profile, early-access
features/
  <resource>/
    actions.ts          # "use server" — Server Actions for that resource
    queries.ts           # plain async functions for Server Component reads
                          # (not actions — see §1 and each section below)
app/
  api/v1/
    social-connections/[platform]/connect/route.ts    # §7
    social-connections/[platform]/callback/route.ts    # §7
    x/external-posts/route.ts                          # §7
```

Domain services are the only layer that touches Drizzle. Actions and the 3 remaining routes both call into `domain/*`, never the ORM directly — this is unchanged from `architecture.md`'s "Domain Layer Rule" and is what lets Trigger.dev tasks reuse the exact same logic.

---

## 7. The three calls that stay Route Handlers

Given the clarified unknowns, only these remain, and for reasons that don't change:

| Call                                                 | Why it can't be a Server Action                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/social-connections/[platform]/callback` | **Hard requirement.** This URL is registered with LinkedIn/X and hit by _their_ server via an external browser redirect. Server Actions are only invocable from SkillTrail's own Next.js client runtime — there is no way for an external OAuth provider to invoke one. |
| `POST /api/v1/social-connections/[platform]/connect` | Soft recommendation, kept for symmetry with the callback above and so the "Connect" UI element can be a plain `<a href>` that works with no client JS at all.                                                                                                           |
| `GET /api/v1/x/external-posts`                       | Soft recommendation. This backs a searchable, paginated reply/quote picker; a plain `fetch`-based `GET` gives natural request cancellation (`AbortController`) for search-as-you-type, which a Server Action call does not give you as cleanly.                         |

These three keep using a minimal version of the v1 `withApiHandler` pattern, built on the **same** `lib/errors.ts`:

```ts
// lib/http-handler.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppError, type AppErrorCode } from "@/lib/errors";

const statusFor: Record<AppErrorCode, number> = {
	BAD_REQUEST: 400,
	UNAUTHENTICATED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	AI_PROPOSAL_PENDING: 409,
	RATE_LIMITED: 429,
	PROVIDER_ERROR: 502,
	INTERNAL_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
};

export async function withRouteHandler<T>(
	request: Request,
	handler: (ctx: { userId: string }) => Promise<T>,
): Promise<NextResponse> {
	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user)
			throw new AppError("UNAUTHENTICATED", "Sign in required.");
		const data = await handler({ userId: session.user.id });
		return NextResponse.json({ success: true, data });
	} catch (e) {
		if (e instanceof AppError) {
			return NextResponse.json(
				{
					success: false,
					error: { code: e.code, message: e.message, details: e.details },
				},
				{ status: statusFor[e.code] },
			);
		}
		console.error("Unhandled route error:", e);
		return NextResponse.json(
			{
				success: false,
				error: { code: "INTERNAL_ERROR", message: "Something went wrong." },
			},
			{ status: 500 },
		);
	}
}
```

### 7.1 `POST /api/v1/social-connections/[platform]/connect`

Accepts nothing; builds the OAuth `authorizationUrl` via `socialConnectionService.buildAuthorizationUrl(userId, platform)` and redirects. Because this is a plain link-driven navigation (not a fetch the UI reads JSON from), it 302-redirects directly rather than returning JSON:

```ts
// app/api/v1/social-connections/[platform]/connect/route.ts
export async function GET(
	request: Request,
	{ params }: { params: { platform: "linkedin" | "x" } },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user)
		return NextResponse.redirect(new URL("/login", request.url));
	const url = await socialConnectionService.buildAuthorizationUrl(
		session.user.id,
		params.platform,
	);
	return NextResponse.redirect(url);
}
```

UI: `<a href="/api/v1/social-connections/linkedin/connect">Connect LinkedIn</a>` — no JS required.

### 7.2 `GET /api/v1/social-connections/[platform]/callback`

**OAuth callback**, unchanged in shape from v1: exchanges the provider's code server-side, stores encrypted tokens via `socialConnectionService.completeConnection(...)`, and redirects into the app. Tokens never reach the response body. Not wrapped in `withRouteHandler` since it must always redirect, success or failure, rather than return JSON.

### 7.3 `GET /api/v1/x/external-posts`

Query: `?connectionId=<uuid>&query=<string>&cursor=<cursor>&limit=20`. Wrapped in `withRouteHandler`, delegates to `xExternalPostService.search(userId, params)`. Returns the same shape as v1:

```ts
{
	items: Array<{
		id: string;
		platformPostId: string;
		authorHandle: string | null;
		textSnippet: string | null;
		postedAt: string | null;
		fetchedAt: string;
	}>;
	nextCursor: string | null;
}
```

---

Everything below is a Server Action unless explicitly marked "data-access function" (a plain server-only function called directly from a Server Component, not an action, not a route).

---

## 8. Profile & personalization

### `updateProfile`

- Client: `authActionClient`
- Bind args: none
- Input:
  ```ts
  z.object({
  	experienceLevel: experienceLevelSchema.nullable().optional(),
  	preferredPlatforms: z.array(platformSchema).optional(),
  	writingTone: writingToneSchema.nullable().optional(),
  	technicalDepth: technicalDepthSchema.nullable().optional(),
  	emojiUsage: emojiUsageSchema.nullable().optional(),
  	writingInstruction: z.string().nullable().optional(),
  	technologyIds: z.array(z.string().uuid()).optional(),
  	interestIds: z.array(z.string().uuid()).optional(),
  });
  ```
- Domain call: `profileService.update(userId, patch)`. `technologyIds`/`interestIds` are still a **full replace**, validated against the catalog _before_ any write — same as v1. An unknown ID is a `validationErrors` case (`technologyIds` field), not a `serverError`.
- Returns: the full `Profile` shape (same as v1's `GET /profile`).
- `serverError.code`: none expected in normal operation beyond `INTERNAL_ERROR`.

### `getProfile(userId)` — data-access function

Initial load for the profile/settings page. Returns the same `Profile` shape as v1.

### `searchTechnologies` / `searchInterests`

Read-only Server Actions (client-triggered, used for the onboarding search-as-you-type UI):

- Client: `authActionClient`
- Input: `z.object({ query: z.string().optional() })`
- Returns: `{ items: Array<{ id: string; name: string }> }`, alphabetical, client-filterable subset.

---

## 9. Content

### `createContent`

- Bind args: none
- Input:
  ```ts
  z.object({
  	rawText: z.string().nullable().optional(),
  	origin: z.enum(["manual", "research", "discovery"]).default("manual"),
  	researchId: z.string().uuid().nullable().optional(),
  	discoveryItemId: z.string().uuid().nullable().optional(),
  	contextMedia: z
  		.array(
  			z.object({
  				mediaId: z.string().uuid(),
  				note: z.string().nullable().optional(),
  			}),
  		)
  		.optional(),
  });
  ```
- Domain call: `contentService.create(userId, input)`
- Returns: same `Content` shape as v1 §6, including `contextMedia`.
- `serverError.code`: `NOT_FOUND` if `researchId`/`discoveryItemId` don't belong to the user / don't exist.

### `updateContent`

- Bind args: `[contentId: z.ZodString]`
- Input: `z.object({ rawText: z.string().nullable().optional(), origin: z.enum(["manual","research","discovery"]).optional() })`
- Returns: `Content`
- `serverError.code`: `NOT_FOUND`

### `deleteContent`

- Bind args: `[contentId: z.ZodString]`
- Input: none
- Domain call: `contentService.delete(userId, contentId)` — still must respect the Publication `RESTRICT` FK (domain.md "Content deletion" invariant).
- Returns: `{ deleted: true }`
- `serverError.code`: `NOT_FOUND`, `CONFLICT` (live Publication blocks deletion — same case as v1's 409)

### `getContentList(userId, { limit, cursor })` / `getContent(userId, contentId)` — data-access functions

Same return shapes as v1 §6 (`ContentSummary[]` / `{ content, angles, compositions }`).

---

## 10. Content context media

### `addContextMedia`

- Bind args: `[contentId: z.ZodString]`
- Input: `z.object({ mediaId: z.string().uuid(), note: z.string().nullable().optional() })`
- Returns: `{ contentId: string; mediaId: string; note: string | null }`
- `serverError.code`: `NOT_FOUND` (content or media not owned by caller)

### `removeContextMedia`

- Bind args: `[contentId: z.ZodString, mediaId: z.ZodString]`
- Input: none
- Returns: `{ deleted: true }`
- `serverError.code`: `NOT_FOUND`

---

## 11. Content understanding & angles

Both are content-level AI operations; per domain.md they do **not** create `ai_generation` rows (that history is Draft-scoped only).

### `analyzeContent`

- Bind args: `[contentId: z.ZodString]`
- Input: `z.object({ force: z.boolean().optional() })`
- Domain call: `contentService.understand(userId, contentId, { force })` → calls the `AiProvider.understandContent` abstraction from `architecture.md`, caches the result on `content.understandingResult`.
- Returns: `{ processingStatus: "understood", understandingResult: unknown }`
- `serverError.code`: `NOT_FOUND`, `PROVIDER_ERROR`, `RATE_LIMITED`

### `generateAngles`

- Bind args: `[contentId: z.ZodString]`
- Input: `z.object({ count: z.number().int().min(1).max(10).optional() })`
- Returns: `{ angles: Array<{ id: string; contentId: string; researchId: null; label: string; description: string | null; createdAt: string }> }`
- `serverError.code`: `NOT_FOUND`, `PROVIDER_ERROR`, `RATE_LIMITED`

---

## 12. Composition

### `createComposition`

- Bind args: `[contentId: z.ZodString]`
- Input: `z.object({ angleId: z.string().uuid().nullable().optional() })`
- Returns: `{ id, contentId, angleId, createdAt, updatedAt }`
- `serverError.code`: `NOT_FOUND` (content or angle not owned)

### `getCompositionList(userId, contentId, { limit, cursor })` / `getComposition(userId, compositionId)` — data-access functions

Same shapes as v1 §9.

---

## 13. Draft

### `createDraft`

- Bind args: `[compositionId: z.ZodString]`
- Input:
  ```ts
  z.object({
  	platform: platformSchema,
  	bodyText: z.string().nullable().optional(),
  	xPostType: xPostTypeSchema.optional(),
  	targetKind: draftTargetKindSchema.nullable().optional(),
  	targetExternalPostId: z.string().uuid().nullable().optional(),
  	targetPublicationId: z.string().uuid().nullable().optional(),
  });
  ```
- Domain call enforces the unique `(compositionId, platform)` constraint.
- Returns: `Draft`
- `serverError.code`: `NOT_FOUND`, `CONFLICT` (a Draft already exists for this Composition/platform — same case as v1's 409)

### `updateDraft`

Fully worked in §5.2. `serverError.code`: `NOT_FOUND`, `AI_PROPOSAL_PENDING`.

### `getDraftList(userId, compositionId)` / `getDraft(userId, draftId)` — data-access functions

Same shapes as v1 §10 (the latter includes `threadPosts`, `media`, `pendingAiGeneration`, `currentAiGeneration`). If the draft page wants to poll while an AI proposal is pending, re-call `getDraft` from a client interval via a thin read action rather than adding a route:

### `pollDraft` — read-only Server Action

- Bind args: `[draftId: z.ZodString]`
- Returns: same shape as `getDraft`
- Used only for the "waiting on a pending AI proposal" polling case; the initial render still goes through `getDraft` as a Server Component read.

---

## 14. X thread / external posts

### `createThreadPost`

- Bind args: `[draftId: z.ZodString]`
- Input: `z.object({ bodyText: z.string().min(1), position: z.number().int().min(0) })`
- Returns: `XThreadPost`
- `serverError.code`: `NOT_FOUND`, `CONFLICT` (`position` not unique within the draft)

### `updateThreadPost`

- Bind args: `[draftId: z.ZodString, threadPostId: z.ZodString]`
- Input: `z.object({ bodyText: z.string().min(1).optional(), position: z.number().int().min(0).optional() })`
- Returns: `XThreadPost`
- `serverError.code`: `NOT_FOUND`, `CONFLICT`

### `deleteThreadPost`

- Bind args: `[draftId: z.ZodString, threadPostId: z.ZodString]`
- Returns: `{ deleted: true }`
- `serverError.code`: `NOT_FOUND`

### `GET /api/v1/x/external-posts` — Route Handler

See §7.3. Unchanged from v1.

---

## 15. AI generation & review

`generate`/`edit` are plain (non-streaming) Server Actions per the clarified "no streaming AI UX" decision — `useAction`'s `isPending` state is sufficient loading UX, per `next-safe-action`'s Hooks guide.

### `generateDraft`

- Bind args: `[draftId: z.ZodString]`
- Input: `z.object({ instruction: z.string().optional(), targetXThreadPostId: z.string().uuid().nullable().optional() })`
- Domain call: `aiGenerationService.generate(userId, draftId, input)` → `AiProvider.generateDraft`/`regenerate`, records the `ai_generation` row as `pending`.
- Returns: `{ generation: AiGeneration; proposal: { beforeText: string | null; afterText: string; operation: "generate_draft" | "regenerate" } }`
- `serverError.code`: `NOT_FOUND`, `PROVIDER_ERROR`, `RATE_LIMITED`

### `editDraft`

- Bind args: `[draftId: z.ZodString]`
- Input: `z.object({ instruction: z.string().min(1), targetXThreadPostId: z.string().uuid().nullable().optional() })`
- Returns: `{ generation: AiGeneration; proposal: { beforeText, afterText, operation: "edit_draft" } }`
- `serverError.code`: `NOT_FOUND`, `PROVIDER_ERROR`, `RATE_LIMITED`

### `acceptAiGeneration`

- Bind args: `[draftId: z.ZodString, generationId: z.ZodString]`
- Input: none
- Returns: `{ draft: Draft; generation: AiGeneration }`
- `serverError.code`: `NOT_FOUND`, `CONFLICT` (generation isn't the current pending one)

### `rejectAiGeneration`

- Bind args: `[draftId: z.ZodString, generationId: z.ZodString]`
- Input: none
- Returns: `{ draft: Draft; generation: AiGeneration }`
- `serverError.code`: `NOT_FOUND`, `CONFLICT`

### `restoreAiGeneration`

- Bind args: `[draftId: z.ZodString, generationId: z.ZodString]`
- Input: `z.object({ confirm: z.literal(true) })`
- Returns: `{ draft: Draft; generation: AiGeneration; composition: Composition }` — a **new** `composition` when restoration crosses into an older Composition state (domain.md rule; never mutates the old one).
- `serverError.code`: `NOT_FOUND`

### `getAiGenerationList(userId, draftId, { limit, cursor })` / `getAiGeneration(userId, draftId, generationId)` — data-access functions

Same shapes as v1 §12. If the UI has a "compare generations" panel that loads detail on demand without navigating, wrap the second one as a thin read action (`loadAiGenerationDetail`) using the same bind-args pattern.

---

## 16. Preview

### `previewDraft`

- Bind args: `[draftId: z.ZodString]`
- Input: none
- Returns:
  ```ts
  {
  	platform: "linkedin" | "x";
  	preview: unknown;
  	validation: { valid: boolean; errors: string[]; warnings: string[]; characterCount?: number };
  }
  ```
- `serverError.code`: `NOT_FOUND`

---

## 17. Media

### `createMediaUploadIntent`

- Bind args: none
- Input: `z.object({ filename: z.string().min(1), mimeType: z.string().min(1), sizeBytes: z.number().int().positive(), kind: mediaKindSchema })`
- Domain call: `mediaService.createUploadIntent(userId, input)` — issues the R2 presigned URL. No binary crosses through the action.
- Returns: `{ mediaId: string; uploadUrl: string; expiresAt: string }`
- `serverError.code`: `VALIDATION_ERROR`-equivalent handled via `validationErrors` on `sizeBytes`/`mimeType` if you enforce limits in the schema (recommended); otherwise none expected.

### `completeMediaUpload`

- Bind args: `[mediaId: z.ZodString]`
- Input: none
- Returns: `Media`
- `serverError.code`: `NOT_FOUND`

### `deleteMedia`

- Bind args: `[mediaId: z.ZodString]`
- Returns: `{ deleted: true }`
- `serverError.code`: `NOT_FOUND`, `CONFLICT` (still referenced by `draft_media`/`content_context_media` FK)

### `listMedia` — read-only Server Action

- Input: `z.object({ limit: z.number().int().min(1).max(50).default(20), cursor: z.string().nullable().optional() })`
- Returns: `{ items: Media[]; nextCursor: string | null }`
- Used by the media-library modal picker's pagination; the media library **page's** first load is a plain `getMediaList` data-access function instead.

### `getMedia(userId, mediaId)` — data-access function

---

## 18. Draft media

### `attachDraftMedia`

- Bind args: `[draftId: z.ZodString]`
- Input: `z.object({ mediaId: z.string().uuid(), position: z.number().int().min(0).optional(), xThreadPostId: z.string().uuid().nullable().optional() })`
- Returns: `{ id, draftId, mediaId, xThreadPostId, position, createdAt }`
- `serverError.code`: `NOT_FOUND`

### `updateDraftMedia`

- Bind args: `[draftId: z.ZodString, draftMediaId: z.ZodString]`
- Input: `z.object({ position: z.number().int().min(0).optional() })`
- Returns: `DraftMedia`
- `serverError.code`: `NOT_FOUND`

### `removeDraftMedia`

- Bind args: `[draftId: z.ZodString, draftMediaId: z.ZodString]`
- Returns: `{ deleted: true }`
- `serverError.code`: `NOT_FOUND`

---

## 19. Social connections

### `getSocialConnectionList(userId)` — data-access function

Same shape as v1 §16 (no tokens, ever).

### `POST /api/v1/social-connections/[platform]/connect` and `GET /api/v1/social-connections/[platform]/callback` — Route Handlers

See §7.1–7.2.

### `disconnectSocialConnection`

- Bind args: `[connectionId: z.ZodString]`
- Input: none
- Returns: `{ connection: SocialConnectionSummary }`
- `serverError.code`: `NOT_FOUND`

### `deleteSocialConnection`

- Bind args: `[connectionId: z.ZodString]`
- Returns: `{ deleted: true }`
- `serverError.code`: `NOT_FOUND`

---

## 20. Publications

### `createPublication`

- Bind args: `[draftId: z.ZodString]`
- Input: `z.object({ mode: publicationModeSchema, scheduledFor: z.string().datetime().optional(), socialConnectionId: z.string().uuid().optional() }).refine(v => v.mode === "now" || !!v.scheduledFor, { message: "scheduledFor is required when mode is \"schedule\"", path: ["scheduledFor"] })`
- Domain call enforces, in order: pending AI proposal resolved (`INVARIANT-AI-011`), platform connection matches Draft platform, snapshot captured — identical rules to v1.
- Returns: `{ publication: Publication; snapshot: unknown }`
- `serverError.code`: `NOT_FOUND`, `AI_PROPOSAL_PENDING`, `CONFLICT` (no matching connection), `PROVIDER_ERROR`

### `cancelPublication`

- Bind args: `[publicationId: z.ZodString]`
- Returns: `{ publication: Publication }`
- `serverError.code`: `NOT_FOUND`

### `replacePublicationSnapshot`

- Bind args: `[publicationId: z.ZodString]`
- Input: `z.object({ confirm: z.literal(true) })`
- Returns: `{ publication: Publication; snapshot: unknown }`
- `serverError.code`: `NOT_FOUND`

### `deleteExternalPublication`

- Bind args: `[publicationId: z.ZodString]`
- Returns: `{ publication: Publication }` (reflects `deleting` → `deleted`/`delete_failed`, per domain.md's Publication status model — local Content/Draft are never touched)
- `serverError.code`: `NOT_FOUND`, `PROVIDER_ERROR`

### `getPublicationList(userId, filters)` / `getPublication(userId, publicationId)` — data-access functions

---

## 21. Research

### `startResearch`

- Bind args: none
- Input: `z.object({ query: z.string().min(1) })`
- Domain call: `researchService.start(userId, query)` — enqueues a Trigger.dev task (`architecture.md`: long-running research stays on Trigger.dev) and returns immediately with `status: "running"`.
- Returns: `{ research: { id, query, status: "running" | "completed" | "failed", synthesis: string | null, triggerTaskId: string | null, createdAt, updatedAt, completedAt } }`
- `serverError.code`: `RATE_LIMITED`, `SERVICE_UNAVAILABLE`

### `getResearchList(userId, {limit,cursor})` / `getResearch(userId, researchId)` / `getResearchSources` / `getResearchAngles` — data-access functions

Poll `getResearch` from a thin `pollResearch` read action (same shape) while `status === "running"`, mirroring `pollDraft` in §13. No realtime requirement is documented, so interval polling is sufficient.

---

## 22. Discovery

### `markDiscoveryItemSeen`

- Bind args: `[discoveryItemId: z.ZodString]`
- Returns: `{ seenAt: string }`

### `saveDiscoveryItem` / `unsaveDiscoveryItem`

- Bind args: `[discoveryItemId: z.ZodString]`
- Returns: `{ savedAt: string }` / `{ savedAt: null }`

### `dismissDiscoveryItem` / `undismissDiscoveryItem`

- Bind args: `[discoveryItemId: z.ZodString]`
- Returns: `{ dismissedAt: string }` / `{ dismissedAt: null }`

### `createContentFromDiscovery`

- Bind args: `[discoveryItemId: z.ZodString]`
- Input: `z.object({ includeDiscoveryContext: z.literal(true) })`
- Returns: `{ content: Content }`

All five above: `serverError.code`: `NOT_FOUND`. These are the clearest "closely related to UI actions" case in the whole contract — card-level toggles, ideal for `useOptimisticAction`.

### `loadMoreDiscovery` — read-only Server Action

- Input: `z.object({ limit: z.number().int().min(1).max(50).default(20), cursor: z.string().nullable().optional(), category: z.string().optional(), saved: z.boolean().optional() })`
- Returns: same item shape as v1 §19's `GET /discovery`
- The feed's first paint is a `getDiscoveryFeed` data-access function; this action only powers "load more."

### `getDiscoveryItem(userId, discoveryItemId)` — data-access function

---

## 23. Notifications

### `markNotificationRead`

- Bind args: `[notificationId: z.ZodString]`
- Returns: `{ notification: Notification }`
- `serverError.code`: `NOT_FOUND`

### `markAllNotificationsRead`

- Bind args: none
- Returns: `{ updated: number }`

### `updateNotificationPreferences`

- Bind args: none
- Input:
  ```ts
  z.object({
  	consistencyRemindersEnabled: z.boolean().optional(),
  	inactivityThresholdDays: z.number().int().min(1).optional(),
  	emailEnabled: z.boolean().optional(),
  	marketingEmailsEnabled: z.boolean().optional(),
  });
  ```
- Returns: the preference shape from v1 §20. `lastReminderSentAt`/`lastReminderForActivityAt` are still never client-writable — they simply aren't in this input schema, which is a stronger guarantee than a route-level omission since Zod rejects unknown keys outright.

### `getNotificationList(userId, {unreadOnly,limit,cursor})` / `getNotificationPreferences(userId)` — data-access functions

---

## 24. Early-access signup

### `joinEarlyAccess`

- Client: **`actionClient`** (public — no `authActionClient`, matches `early_access` having no user FK)
- Bind args: none
- Input: `z.object({ email: z.string().email() })`
- Domain call: `earlyAccessService.join(email)`.
- **Migration note:** v1 modeled a duplicate email as `409 CONFLICT / EARLY_ACCESS_ALREADY_REGISTERED`. In v2 this becomes a field-level validation error via `returnValidationErrors()` — this is the library's own documented pattern for exactly this case ("email already taken"), and it lets the landing-page form show the error inline next to the email field instead of in a generic error banner:
  ```ts
  import { returnValidationErrors } from "next-safe-action";

  export const joinEarlyAccess = actionClient
  	.inputSchema(emailSchema)
  	.action(async ({ parsedInput: { email } }) => {
  		const exists = await earlyAccessService.exists(email);
  		if (exists) {
  			return returnValidationErrors(emailSchema, {
  				email: { _errors: ["This email is already on the list."] },
  			});
  		}
  		await earlyAccessService.join(email);
  		return { joined: true as const };
  	});
  ```
- Returns: `{ joined: true }`
- Because this is the landing page's primary conversion action and now confirmed to always live in this app, it's also a good candidate to additionally expose as a `.stateAction()` bound to `<form action={...}>` for progressive enhancement (works before hydration/without JS) — see the Form Actions pattern in §3's linked docs.

---

## 25. History (read model)

Unchanged fact from v1: there is no `history` table; it's composed from Content/Composition/Draft/AiGeneration/Publication. `getHistory(userId, {limit,cursor,platform})` is a data-access function for the initial page; `loadMoreHistory` is its read-Server-Action counterpart for infinite scroll, same shape as v1 §22.

---

## 26. Trigger.dev boundary

Unchanged from `architecture.md`: Trigger.dev tasks call `domain/*` services directly — never a Server Action, never a Route Handler. Server Actions that need durable/background work (`startResearch`, `createPublication` in `schedule` mode) enqueue a Trigger.dev task and return immediately; the task itself, running outside the request lifecycle, imports the same domain module the action imported. Nothing here changes by moving from routes to actions — this boundary was never HTTP-shaped to begin with.

---

## 27. External provider error normalization

Unchanged in concept: provider-specific failures (LinkedIn/X API errors, Gemini failures) are still normalized to `providerError()` before crossing the action/route boundary, carrying the same `failureReason` enum (`account_disconnected | platform_error | rate_limited | validation_error | unknown`) in `details`:

```ts
throw providerError("The publication could not be completed.", {
	failureReason: "rate_limited",
});
```

On the client this now surfaces as `result.serverError = { code: "PROVIDER_ERROR", message: "...", details: { failureReason: "rate_limited" } }` instead of a JSON HTTP body — same information, one fewer layer (no `NextResponse`/status to construct). Never expose raw provider response bodies, OAuth tokens, or provider diagnostics in `message`/`details`.

---

## 28. Stable error codes

| Code                        | Meaning                                                                                       | Surfaced as                                          |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `BAD_REQUEST`               | Malformed/invalid command that isn't a schema shape issue                                     | `serverError`                                        |
| `UNAUTHENTICATED`           | No valid Better Auth session                                                                  | `serverError` (via `authorize`, §3.2)                |
| `FORBIDDEN`                 | Authenticated but not allowed (rare in V1; ownership uses `NOT_FOUND` instead, per domain.md) | `serverError`                                        |
| `NOT_FOUND`                 | Missing resource or caller doesn't own it                                                     | `serverError`                                        |
| `CONFLICT`                  | Valid request conflicts with current domain state (duplicate Draft platform, etc.)            | `serverError`                                        |
| `AI_PROPOSAL_PENDING`       | Specific, client-distinguishable `CONFLICT`: manual edit blocked by a pending AI proposal     | `serverError`                                        |
| — (schema/field validation) | A field fails its Zod rule, or a business rule tied to one field (e.g. duplicate email)       | `validationErrors` (native, not a `code`)            |
| `RATE_LIMITED`              | API/provider rate limit                                                                       | `serverError`                                        |
| `PROVIDER_ERROR`            | External provider (LinkedIn/X/Gemini) failure                                                 | `serverError`                                        |
| `INTERNAL_ERROR`            | Unexpected failure                                                                            | `serverError` (default `handleServerError` fallback) |
| `SERVICE_UNAVAILABLE`       | Temporary dependency unavailable                                                              | `serverError`                                        |

`EARLY_ACCESS_ALREADY_REGISTERED` from v1 is retired as a `code` — see the migration note in §24; it's now a `validationErrors.email` message instead, which is a strictly more useful representation for the one form it applies to.

---

## 29. Ownership enforcement (recap)

Unchanged rule, now enforced at the domain-service layer for both entry points that remain (Server Actions and the 2 non-OAuth Route Handlers):

```text
user
 ├── content → composition → draft → ai_generation
 ├── media
 ├── research
 ├── publication
 ├── social_connection
 └── notification
```

A resource that exists but belongs to someone else returns `NOT_FOUND` — never confirms existence via `FORBIDDEN`. Global discovery items remain the one exception (unowned; `user_discovery_item` is the owned personalization layer).

---

## 30. Contract-level invariants

All 32 invariants from v1 §27 still hold; only the transport changed. Two are worth restating because their _mechanism_ changed:

- **#7/#8 (AI proposal must be explicitly accepted/rejected; blocks manual edits):** enforced by `draftService.updateDraft` throwing `aiProposalPending()`, surfaced to the client as `serverError.code === "AI_PROPOSAL_PENDING"`, not an HTTP 409.
- **#29 (routes don't bypass domain services with ad-hoc logic):** now reads "actions and routes don't bypass domain services" — `.action()` callbacks and the 2 remaining Route Handlers are both required to be thin adapters, per §3.2/§7.

---

## 31. Implementation order

Unchanged sequence from v1 §29 — it follows the schema/domain dependency graph, not the transport mechanism:

1. Shared infra: `lib/errors.ts`, `lib/safe-action.ts`, `lib/schemas/enums.ts`
2. Profile + technology/interest
3. Content + context media
4. Content understanding + angles
5. Composition
6. Draft CRUD
7. X thread/external-post support (incl. the one remaining search Route Handler)
8. AI generation/review/history
9. Media upload/library
10. Social connections/OAuth (the 2 remaining Route Handlers)
11. Preview/verification
12. Publications + immutable snapshots
13. Research
14. Discovery + personalization
15. Notifications/preferences
16. Early-access
17. History read model

---

## 32. Schema authority rule

Unchanged: the uploaded Drizzle schema and `relations.ts` remain authoritative for persistence. This document describes the application-boundary contract (now mostly Server Actions); it introduces no new tables, columns, enums, or relations. Where an action needs persistence the schema doesn't support, that's a schema/domain change to review separately — exactly as `CLAUDE.md`'s "WHEN A SCHEMA CHANGE IS PROPOSED" section requires.

---

## Resolved Assumptions and Decisions

### 1. Authentication error handling

**Decision:** Use the `authorize` override and map unauthenticated requests to SkillTrail's existing `AppError` system.

The action client should throw:

```ts
new AppError("UNAUTHENTICATED", 401, "Unauthenticated");
```

or the existing `unauthenticated()` helper from `lib/errors.ts`.

Do not use the adapter's framework-native `unauthorized()` path for SkillTrail V1.

**Reason:** SkillTrail already has a centralized application error model. Keeping authentication failures inside the same `AppError` channel means Server Actions have one consistent error representation instead of mixing framework-specific unauthorized errors with application errors.

The experimental `authInterrupts` behavior is not required for V1.

This is an explicit SkillTrail architectural decision, not a framework requirement.

---

### 2. Validation Error Shape

**Decision:** Use:

```ts
defaultValidationErrorsShape: "flattened";
```

for SkillTrail V1.

**Reason:** SkillTrail's existing API contract represents field validation errors as:

```ts
Record<string, string[]>;
```

For example:

```ts
{
	writingInstruction: ["Maximum 1000 characters"],
	technologyIds: ["Invalid technology ID"],
}
```

The flattened `fieldErrors` shape maps directly to SkillTrail's form fields and preserves the validation-error structure already used by the previous HTTP API implementation.

With `next-safe-action`, this is accessed through:

```ts
result.validationErrors?.fieldErrors?.writingInstruction?.[0];
```

### Important limitation

`"flattened"` only represents one level of fields. It does not preserve deeply nested object validation errors.

Therefore:

- Use **flattened** as the default for V1.
- Prefer flat action input schemas where practical.
- If a specific action genuinely requires deeply nested input and its UI needs nested validation errors, use the per-action `handleValidationErrorsShape` override or `"formatted"` shape for that action.
- Do not change the global default merely to support a hypothetical future nested form.

The global choice is therefore:

```ts
defaultValidationErrorsShape: "flattened";
```

while individual actions may override the shape when their actual input structure requires it.

**Do not enable `throwValidationErrors` globally.** Validation failures should remain available through `result.validationErrors` so forms and interactive actions can handle them as structured action results. Only enable `throwValidationErrors` for a specific action if there is a concrete requirement for exception-based handling.

---

### 3. Bind-argument resource IDs

**Decision:** Use Server Action bind arguments for resource IDs on mutating resource actions.

Example:

```ts
const boundAction = action.bind(null, resourceId);
```

The resource ID should normally originate from a server-known resource and be bound before the action reference is passed to a client component.

Do not design mutating actions around raw client-constructed resource IDs when the resource can be bound at the Server Action boundary.

For example, prefer the conceptual structure:

```text
Server Component
	↓
knows resource.id
	↓
action.bind(null, resource.id)
	↓
Client Component
	↓
invoke action
```

rather than:

```text
Client
	↓
construct resourceId
	↓
send resourceId as ordinary action input
```

### Important security rule

A bound resource ID is **not an authorization mechanism**.

The domain service must still verify ownership:

```text
Bound resource ID
	↓
Server Action
	↓
Domain Service
	↓
Verify resource belongs to authenticated user
	↓
Perform operation
```

Binding identifies the resource being operated on. The domain layer remains responsible for authorization and ownership checks.

---

### 3. `useAction` vs `useStateAction`

**Decision:** Use `useAction` for interactive SkillTrail V1 mutations, including AI generation and editing.

Do not move AI generation/editing to `.stateAction()` / `useStateAction` as part of this migration.

SkillTrail V1 is an interactive authenticated application and does not require form-native progressive enhancement for these operations.

AI generation/editing is explicitly non-streaming in V1, so a normal action with pending/loading state is sufficient.

Conceptually:

```text
User clicks Generate
	↓
useAction
	↓
Server Action
	↓
AI generation
	↓
Final result
```

Do not interpret `stateAction` as an AI streaming mechanism. State actions and streaming are separate concerns.

---

## Final V1 Decisions

| Area                              | Decision                                                 |
| --------------------------------- | -------------------------------------------------------- |
| Better Auth adapter               | `@next-safe-action/adapter-better-auth`                  |
| Authentication errors             | SkillTrail `AppError` via `authorize` override           |
| Native `unauthorized()`           | Not used for V1                                          |
| Validation errors                 | `defaultValidationErrorsShape: "flattened"`              |
| Resource IDs                      | Bind arguments for mutations                             |
| Resource authorization            | Always enforced in domain layer                          |
| AI generate/edit                  | `useAction`                                              |
| AI streaming                      | Not part of V1                                           |
| `stateAction`                     | Only where form-native progressive enhancement is useful |
| All mutations using `stateAction` | No                                                       |

These decisions are now considered resolved for the V1 migration. Future changes should be driven by a concrete product or UX requirement rather than introduced speculatively.
