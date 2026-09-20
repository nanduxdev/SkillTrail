# SkillTrail API Contract

> **Status:** V1 API contract  
> **Source of truth:** the uploaded Drizzle schema (`db/schema/*.ts` equivalent files), `relations.ts`, and the existing SkillTrail domain/product/architecture documents.
>
> This document defines the HTTP contract: routes, accepted input, returned data, response formatting, validation, and error handling. Database implementation remains owned by the Drizzle schema.

---

## 1. API conventions

### Base path

```text
/api/v1
```

Better Auth owns:

```text
/api/v1/auth/*
```

SkillTrail application routes must not be added under that prefix.

### Authentication

All application endpoints are authenticated unless explicitly marked **Public** or **OAuth**.

The server derives `userId` from the Better Auth session. A client must never be trusted to provide a `userId` for ownership.

### JSON

Normal API requests/responses use:

```http
Content-Type: application/json
```

Binary media should use the R2 upload flow rather than embedding file data in JSON.

### IDs

Schema IDs are UUIDs. API examples therefore use UUID-shaped opaque identifiers.

### Timestamps

Use ISO-8601 UTC strings in API responses:

```text
2026-09-19T12:34:56.000Z
```

### Pagination

For collection endpoints:

```text
?limit=20&cursor=<opaque-cursor>
```

Response:

```json
{
	"items": [],
	"nextCursor": null
}
```

The API should cap `limit` server-side.

---

# 2. Standard response envelope

SkillTrail uses `success`, **not** `ok`.

Every SkillTrail application response follows one of these shapes.

## Success

```ts
type ApiSuccess<T> = {
	success: true;
	data: T;
	meta?: Record<string, unknown>;
};
```

Example:

```json
{
	"success": true,
	"data": {
		"id": "8b0b8c3e-...",
		"origin": "manual",
		"processingStatus": "raw"
	}
}
```

`meta` is optional and is reserved for additional response metadata when needed. V1 does not track or return request IDs.

## Error

```ts
type ApiFailure = {
	success: false;
	error: {
		code: string;
		message: string;
		fieldErrors?: Record<string, string[]>;
		details?: unknown;
	};
	meta?: Record<string, unknown>;
};
```

Example:

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "The request contains invalid fields.",
		"fieldErrors": {
			"platform": ["Expected linkedin or x."]
		}
	}
}
```

### HTTP status mapping

| HTTP | Meaning                                                   | Standard code         |
| ---: | --------------------------------------------------------- | --------------------- |
|  400 | Malformed request / invalid command                       | `BAD_REQUEST`         |
|  401 | No valid Better Auth session                              | `UNAUTHENTICATED`     |
|  403 | Authenticated but action is not allowed                   | `FORBIDDEN`           |
|  404 | Missing resource or caller does not own it                | `NOT_FOUND`           |
|  409 | Valid request conflicts with current domain state         | `CONFLICT`            |
|  422 | Request shape is valid but domain/input validation failed | `VALIDATION_ERROR`    |
|  429 | API/provider rate limit                                   | `RATE_LIMITED`        |
|  500 | Unexpected internal failure                               | `INTERNAL_ERROR`      |
|  502 | External provider failure                                 | `PROVIDER_ERROR`      |
|  503 | Temporary dependency unavailable                          | `SERVICE_UNAVAILABLE` |

**Ownership rule:** resource ownership failures return `404`, not `403`.

---

# 3. Centralized response formatting and error handling

Route handlers should be thin adapters around domain services.

Recommended shared API layer:

```text
lib/api/
  errors.ts
  handler.ts
  response.ts
  validation.ts
```

## `response.ts`

Centralize:

```ts
success<T>(data: T, meta?: Record<string, unknown>): Response
error(error: AppError, meta?: Record<string, unknown>): Response
```

Responsibilities:

- always emit `success: true` on successful application responses
- always emit `success: false` on failed application responses
- set HTTP status
- set JSON headers
- keep the envelope identical across all routes
- allow optional response metadata when needed

## `errors.ts`

Use typed application errors:

```ts
class AppError extends Error {
	constructor(
		public readonly code: string,
		public readonly status: number,
		message: string,
		public readonly details?: unknown,
	) {
		super(message);
	}
}
```

Provide helpers such as:

```ts
badRequest(...)
unauthenticated(...)
forbidden(...)
notFound(...)
conflict(...)
validationError(...)
rateLimited(...)
providerError(...)
internalError(...)
```

Domain services should throw application/domain errors, not `NextResponse`.

## `handler.ts`

All authenticated application routes should use one small wrapper:

```ts
export interface ApiContext {
	session: Session;
	user: User;
}

export async function withApiHandler(
	request: Request,
	handler: (ctx: ApiContext) => Promise<unknown>,
): Promise<NextResponse> {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.session || !session?.user) {
			throw unauthenticated();
		}

		const data = await handler({
			session: session.session,
			user: session.user,
		});

		return success(data);
	} catch (error) {
		return errorResponse(error);
	}
}
```

The wrapper should:

1. check the Better Auth session
2. pass the authenticated `session` and `user` to the route handler
3. invoke the route handler
4. convert known application errors into the standard API error response
5. convert unexpected errors into `INTERNAL_ERROR`
6. never expose stack traces, secrets, OAuth tokens, or internal database details

Request IDs are not part of the V1 API contract or response handling.

Request parsing and Zod validation remain explicit at the route boundary using the helpers in `validation.ts`.

## `validation.ts`

Use Zod at the HTTP boundary.

```ts
const input = CreateContentInput.parse(await request.json());
```

API validation does not replace domain validation. Domain services must still enforce invariants.

---

# 4. Authentication

Better Auth owns:

```text
/api/v1/auth/*
```

The schema contains:

- `user`
- `session`
- `account`
- `verification`

These are Better Auth persistence concerns and are not duplicated as normal SkillTrail CRUD endpoints.

Never return:

- session tokens
- OAuth access/refresh tokens
- Better Auth account credentials
- social connection tokens

---

# 5. Profile and personalization

Schema entities:

- `application_profile`
- `technology`
- `user_technology`
- `interest`
- `user_interest`

The profile is 1:1 with the authenticated user.

## `GET /api/v1/profile`

**Auth:** Required

### Accepts

None.

### Returns

```ts
{
  userId: string;
  experienceLevel:
    | "student"
    | "junior"
    | "mid_level"
    | "senior"
    | null;
  preferredPlatforms: Array<"linkedin" | "x">;
  writingTone: "casual" | "balanced" | "formal" | null;
  technicalDepth: "beginner_friendly" | "detailed" | "expert" | null;
  emojiUsage: "none" | "minimal" | "frequent" | null;
  writingInstruction: string | null;
  technologies: Array<{
    id: string;
    name: string;
  }>;
  interests: Array<{
    id: string;
    name: string;
  }>;
}
```

## `PATCH /api/v1/profile`

### Accepts

```ts
{
  experienceLevel?: "student" | "junior" | "mid_level" | "senior" | null;
  preferredPlatforms?: Array<"linkedin" | "x">;
  writingTone?: "casual" | "balanced" | "formal" | null;
  technicalDepth?: "beginner_friendly" | "detailed" | "expert" | null;
  emojiUsage?: "none" | "minimal" | "frequent" | null;
  writingInstruction?: string | null;
  technologyIds?: string[];
  interestIds?: string[];
}
```

### Returns

The same `Profile` shape as `GET`.

### Technology/interest behavior

Technologies and interests are pre-seeded globally. Users search and select from the catalog — no custom entries in V1. Selections are stored in the `user_technology` and `user_interest` junction tables.

Providing `technologyIds` or `interestIds` performs a **full replace** of the user's selections (delete all existing, insert new). Validation of all IDs against the catalog happens before any write.

## `GET /api/v1/profile/technologies`

**Auth:** Required

### Accepts

None.

### Returns

```ts
{
	items: Array<{
		id: string;
		name: string;
	}>;
}
```

Returns all pre-seeded technologies ordered alphabetically. The client handles search/filter.

## `GET /api/v1/profile/interests`

**Auth:** Required

### Accepts

None.

### Returns

```ts
{
	items: Array<{
		id: string;
		name: string;
	}>;
}
```

Returns all pre-seeded interests ordered alphabetically. The client handles search/filter.

---

# 6. Content

Schema entities:

- `content`
- `content_context_media`
- `angle`

Content fields include:

```text
rawText
origin: manual | research | discovery
researchId
discoveryItemId
processingStatus: raw | analyzing | understood | failed
understandingResult
```

## `POST /api/v1/content`

### Accepts

```ts
{
  rawText?: string | null;
  origin?: "manual" | "research" | "discovery";
  researchId?: string | null;
  discoveryItemId?: string | null;
  contextMedia?: Array<{
    mediaId: string;
    note?: string | null;
  }>;
}
```

### Returns

```ts
{
	id: string;
	rawText: string | null;
	origin: "manual" | "research" | "discovery";
	researchId: string | null;
	discoveryItemId: string | null;
	processingStatus: "raw" | "analyzing" | "understood" | "failed";
	understandingResult: unknown | null;
	contextMedia: Array<{
		mediaId: string;
		note: string | null;
	}>;
	createdAt: string;
	updatedAt: string;
}
```

`understandingResult` is JSON data produced by the AI provider; the schema intentionally stores it as `jsonb`.

## `GET /api/v1/content`

### Query

```text
?limit=20&cursor=...
```

Optional filters may be added only when required by the UI.

### Returns

```ts
{
  items: ContentSummary[];
  nextCursor: string | null;
}
```

## `GET /api/v1/content/:contentId`

### Returns

```ts
{
  content: Content;
  angles: Angle[];
  compositions: CompositionSummary[];
}
```

## `PATCH /api/v1/content/:contentId`

### Accepts

```ts
{
  rawText?: string | null;
  origin?: "manual" | "research" | "discovery";
}
```

### Returns

```ts
Content;
```

## `DELETE /api/v1/content/:contentId`

### Returns

```ts
{
	deleted: true;
}
```

Deletion must respect the publication FK restriction. If a live publication in the composition tree prevents deletion:

```text
409 CONFLICT
```

---

# 7. Content context media

## `POST /api/v1/content/:contentId/context-media`

### Accepts

```ts
{
  mediaId: string;
  note?: string | null;
}
```

### Returns

```ts
{
	contentId: string;
	mediaId: string;
	note: string | null;
}
```

## `DELETE /api/v1/content/:contentId/context-media/:mediaId`

### Returns

```ts
{
	deleted: true;
}
```

`content_context_media` is a many-to-many association with an optional `note`. It does not have an ordering field.

---

# 8. Content understanding and angles

Content-level AI operations are separate from draft AI review. They do **not** create `ai_generation` rows.

## `POST /api/v1/content/:contentId/understanding`

### Accepts

```ts
{
}
```

Optionally:

```ts
{
  force?: boolean;
}
```

### Returns

```ts
{
	processingStatus: "understood";
	understandingResult: unknown;
}
```

The generated understanding is cached in `content.understandingResult`.

## `POST /api/v1/content/:contentId/angles`

### Accepts

```ts
{
  count?: number;
}
```

### Returns

```ts
{
	angles: Array<{
		id: string;
		contentId: string;
		researchId: null;
		label: string;
		description: string | null;
		createdAt: string;
	}>;
}
```

An Angle must belong to exactly one parent: Content or Research.

---

# 9. Composition

Schema:

```text
content
  └── composition
       ├── angle?
       ├── draft[]
       └── publication[]
```

A Composition represents a content-creation intent.

Changing the angle creates a new Composition. Regenerating a Draft does not.

## `POST /api/v1/content/:contentId/compositions`

### Accepts

```ts
{
  angleId?: string | null;
}
```

A Composition does not itself contain a platform field. Platforms belong to Draft.

### Returns

```ts
{
	id: string;
	contentId: string;
	angleId: string | null;
	createdAt: string;
	updatedAt: string;
}
```

## `GET /api/v1/content/:contentId/compositions`

### Returns

```ts
{
  items: CompositionSummary[];
  nextCursor: string | null;
}
```

## `GET /api/v1/compositions/:compositionId`

### Returns

```ts
{
  composition: Composition;
  content: ContentSummary;
  angle: Angle | null;
  drafts: Draft[];
  publications: PublicationSummary[];
}
```

---

# 10. Draft

Schema fields:

```text
id
compositionId
platform: linkedin | x
aiAssisted
bodyText
xPostType
targetKind
targetExternalPostId
targetPublicationId
pendingAiGenerationId
currentAiGenerationId
createdAt
updatedAt
```

A unique index enforces exactly one Draft per `(compositionId, platform)`.

## `POST /api/v1/compositions/:compositionId/drafts`

### Accepts

```ts
{
  platform: "linkedin" | "x";
  bodyText?: string | null;
  xPostType?: "standalone" | "reply" | "self_reply" | "thread" | "quote";
  targetKind?: "external" | "own_publication" | null;
  targetExternalPostId?: string | null;
  targetPublicationId?: string | null;
}
```

For X threads, the body text lives on `x_thread_post` rows rather than `draft.bodyText`.

### Returns

```ts
Draft;
```

Attempting to create a second Draft for the same Composition/platform returns `409 CONFLICT`.

## `GET /api/v1/compositions/:compositionId/drafts`

### Returns

```ts
{
  items: Draft[];
}
```

## `GET /api/v1/drafts/:draftId`

### Returns

```ts
{
  draft: Draft;
  threadPosts: XThreadPost[];
  media: DraftMedia[];
  pendingAiGeneration: AiGeneration | null;
  currentAiGeneration: AiGeneration | null;
}
```

## `PATCH /api/v1/drafts/:draftId`

Manual edit.

### Accepts

```ts
{
  bodyText?: string | null;
  xPostType?: "standalone" | "reply" | "self_reply" | "thread" | "quote";
  targetKind?: "external" | "own_publication" | null;
  targetExternalPostId?: string | null;
  targetPublicationId?: string | null;
}
```

### Returns

```ts
Draft;
```

If `pendingAiGenerationId` is set:

```text
409 CONFLICT
```

with:

```text
AI_PROPOSAL_PENDING
```

Manual edits must never silently overwrite a pending AI proposal.

---

# 11. X draft/thread API

Supported X post types:

```text
standalone
reply
self_reply
thread
quote
```

## `GET /api/v1/drafts/:draftId/thread-posts`

### Returns

```ts
{
	items: Array<{
		id: string;
		draftId: string;
		position: number;
		bodyText: string;
		createdAt: string;
		updatedAt: string;
	}>;
}
```

## `POST /api/v1/drafts/:draftId/thread-posts`

### Accepts

```ts
{
	bodyText: string;
	position: number;
}
```

### Returns

```ts
XThreadPost;
```

`position` is unique within the Draft.

## `PATCH /api/v1/drafts/:draftId/thread-posts/:threadPostId`

### Accepts

```ts
{
  bodyText?: string;
  position?: number;
}
```

### Returns

```ts
XThreadPost;
```

## `DELETE /api/v1/drafts/:draftId/thread-posts/:threadPostId`

### Returns

```ts
{
	deleted: true;
}
```

## `GET /api/v1/x/external-posts`

Fetch/paginate external X posts for reply/quote selection.

### Accepts

```text
?connectionId=<uuid>
&query=<string>
&cursor=<cursor>
&limit=20
```

### Returns

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

The database cache is `x_external_post`. It is not a Publication.

---

# 12. AI generation and review

`ai_generation` is the complete user-visible AI generation history for Drafts.

Supported operations:

```text
generate_draft
edit_draft
regenerate
restore
```

Statuses:

```text
pending
accepted
rejected
failed
```

Each generation stores:

```text
instruction
beforeText
afterText
provider
model
latencyMs
promptTokens
completionTokens
errorMessage
createdAt
resolvedAt
```

Thread-specific operations may additionally target `targetXThreadPostId`.

## `POST /api/v1/drafts/:draftId/ai/generate`

### Accepts

```ts
{
  instruction?: string;
  targetXThreadPostId?: string | null;
}
```

### Returns

```ts
{
	generation: AiGeneration;
	proposal: {
		beforeText: string | null;
		afterText: string;
		operation: "generate_draft" | "regenerate";
	}
}
```

The generated result becomes the Draft's pending proposal; it does not automatically become the accepted Draft.

## `POST /api/v1/drafts/:draftId/ai/edit`

### Accepts

```ts
{
  instruction: string;
  targetXThreadPostId?: string | null;
}
```

### Returns

```ts
{
	generation: AiGeneration;
	proposal: {
		beforeText: string | null;
		afterText: string;
		operation: "edit_draft";
	}
}
```

## `GET /api/v1/drafts/:draftId/ai-generations`

### Query

```text
?limit=20&cursor=...
```

### Returns

```ts
{
  items: AiGenerationSummary[];
  nextCursor: string | null;
}
```

## `GET /api/v1/drafts/:draftId/ai-generations/:generationId`

### Returns

```ts
{
	generation: AiGeneration;
}
```

## `POST /api/v1/drafts/:draftId/ai-generations/:generationId/accept`

### Accepts

```ts
{
}
```

### Returns

```ts
{
	draft: Draft;
	generation: AiGeneration;
}
```

Acceptance moves the proposal into current Draft state and marks the generation `accepted`.

## `POST /api/v1/drafts/:draftId/ai-generations/:generationId/reject`

### Accepts

```ts
{
}
```

### Returns

```ts
{
	draft: Draft;
	generation: AiGeneration;
}
```

Rejection keeps the generation in history and marks it `rejected`.

## `POST /api/v1/drafts/:draftId/ai-generations/:generationId/restore`

### Accepts

```ts
{
	confirm: true;
}
```

### Returns

```ts
{
	draft: Draft;
	generation: AiGeneration;
	composition: Composition;
}
```

Restoring never deletes newer generations.

If restoration would cross an older Composition state, create a new Composition rather than mutating the old one.

---

# 13. Preview and verification

## `POST /api/v1/drafts/:draftId/preview`

### Accepts

```ts
{
}
```

### Returns

```ts
{
  platform: "linkedin" | "x";
  preview: unknown;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    characterCount?: number;
  };
}
```

Preview generation is synchronous.

---

# 14. Media

Schema:

```text
media
  ├── content_context_media
  └── draft_media
```

Media binary data lives in Cloudflare R2. The DB stores metadata and `storageKey`.

Media kinds:

```text
image
document
```

## `POST /api/v1/media/upload`

Create an upload intent.

### Accepts

```ts
{
	filename: string;
	mimeType: string;
	sizeBytes: number;
	kind: "image" | "document";
}
```

### Returns

```ts
{
	mediaId: string;
	uploadUrl: string;
	expiresAt: string;
}
```

## `POST /api/v1/media/:mediaId/complete`

### Accepts

```ts
{
}
```

### Returns

```ts
Media;
```

## `GET /api/v1/media`

### Query

```text
?limit=20&cursor=...
```

### Returns

```ts
{
  items: Media[];
  nextCursor: string | null;
}
```

## `GET /api/v1/media/:mediaId`

### Returns

```ts
Media;
```

## `DELETE /api/v1/media/:mediaId`

### Returns

```ts
{
	deleted: true;
}
```

The API must respect `draft_media` and `content_context_media` foreign-key restrictions.

---

# 15. Draft media

`draft_media` has:

```text
draftId
mediaId
xThreadPostId?
position
```

## `POST /api/v1/drafts/:draftId/media`

### Accepts

```ts
{
  mediaId: string;
  position?: number;
  xThreadPostId?: string | null;
}
```

### Returns

```ts
{
	id: string;
	draftId: string;
	mediaId: string;
	xThreadPostId: string | null;
	position: number;
	createdAt: string;
}
```

## `PATCH /api/v1/drafts/:draftId/media/:draftMediaId`

### Accepts

```ts
{
  position?: number;
}
```

### Returns

```ts
DraftMedia;
```

## `DELETE /api/v1/drafts/:draftId/media/:draftMediaId`

### Returns

```ts
{
	deleted: true;
}
```

---

# 16. Social connections

Social connections are separate from Better Auth `account`.

Statuses:

```text
connected
disconnected
expired
revoked
```

Supported platforms:

```text
linkedin
x
```

The DB contains encrypted server-only:

```text
accessToken
refreshToken
```

These fields must never be returned.

## `GET /api/v1/social-connections`

### Returns

```ts
{
	items: Array<{
		id: string;
		platform: "linkedin" | "x";
		platformUserId: string;
		platformUsername: string | null;
		displayName: string | null;
		avatarUrl: string | null;
		scopes: string[] | null;
		status: "connected" | "disconnected" | "expired" | "revoked";
		platformCapabilities: unknown | null;
		connectedAt: string;
		disconnectedAt: string | null;
		lastCheckedAt: string | null;
	}>;
}
```

No access/refresh tokens.

## `POST /api/v1/social-connections/:platform/connect`

**OAuth**

### Accepts

```ts
{
}
```

### Returns

```ts
{
	authorizationUrl: string;
}
```

## `GET /api/v1/social-connections/:platform/callback`

**OAuth callback**

The provider callback is handled server-side. Tokens are stored securely and are not returned to the browser.

The callback should redirect to the application after successful/failed connection.

## `POST /api/v1/social-connections/:connectionId/disconnect`

### Returns

```ts
{
	connection: SocialConnectionSummary;
}
```

Disconnect stops active authorization but keeps the remembered account row.

## `DELETE /api/v1/social-connections/:connectionId`

### Returns

```ts
{
	deleted: true;
}
```

This deletes the SkillTrail connection record, not the external social account.

---

# 17. Publications

Schema:

```text
publication
  ├── composition
  ├── source draft
  └── social connection
```

Publication statuses:

```text
scheduled
publishing
published
publish_failed
cancelled
deleted
delete_failed
```

Failure reasons:

```text
account_disconnected
platform_error
rate_limited
validation_error
unknown
```

The `snapshot` JSON is immutable approved publication state.

## `POST /api/v1/drafts/:draftId/publications`

Create immediate or scheduled publication.

### Accepts

```ts
{
  mode: "now" | "schedule";
  scheduledFor?: string;
  socialConnectionId?: string;
}
```

The selected connection must match the Draft platform.

For `schedule`, `scheduledFor` is required.

### Returns

```ts
{
	publication: {
		id: string;
		userId: string;
		compositionId: string;
		draftId: string | null;
		platform: "linkedin" | "x";
		socialConnectionId: string | null;
		status: "scheduled" |
			"publishing" |
			"published" |
			"publish_failed" |
			"cancelled" |
			"deleted" |
			"delete_failed";
		scheduledFor: string | null;
		publishedAt: string | null;
		externalPostId: string | null;
		externalPostUrl: string | null;
		triggerTaskId: string | null;
		attemptCount: number;
		failureReason: "account_disconnected" |
			"platform_error" |
			"rate_limited" |
			"validation_error" |
			"unknown" |
			null;
		cancelledAt: string | null;
		deletedAt: string | null;
		createdAt: string;
		updatedAt: string;
	}
	snapshot: unknown;
}
```

Before creating a Publication:

- pending AI proposal must be resolved
- required platform connection must be available
- snapshot must capture the approved Draft state
- subsequent Draft edits must not modify the snapshot

## `GET /api/v1/publications`

### Query

```text
?status=scheduled|publishing|published|publish_failed|cancelled|deleted|delete_failed
&platform=linkedin|x
&limit=20
&cursor=...
```

### Returns

```ts
{
  items: PublicationSummary[];
  nextCursor: string | null;
}
```

## `GET /api/v1/publications/:publicationId`

### Returns

```ts
{
	publication: Publication;
	snapshot: unknown;
}
```

## `POST /api/v1/publications/:publicationId/cancel`

Cancel a scheduled Publication.

### Returns

```ts
{
	publication: Publication;
}
```

The Draft remains.

## `POST /api/v1/publications/:publicationId/replace-snapshot`

Replace the scheduled snapshot with the current Draft after explicit confirmation.

### Accepts

```ts
{
	confirm: true;
}
```

### Returns

```ts
{
	publication: Publication;
	snapshot: unknown;
}
```

## `DELETE /api/v1/publications/:publicationId/external`

Delete the external social post while retaining local SkillTrail content.

### Returns

```ts
{
	publication: Publication;
}
```

Deletion follows:

```text
published
  → deleting
  → deleted | delete_failed
```

If deletion fails, return the normalized failure state rather than deleting the local Draft/Content.

---

# 18. Research

Schema:

```text
research
  ├── research_source[]
  ├── angle[]
  └── content[]
```

Research statuses:

```text
running
completed
failed
```

## `POST /api/v1/research`

Start a research session.

### Accepts

```ts
{
	query: string;
}
```

### Returns

```ts
{
	research: {
		id: string;
		query: string;
		status: "running" | "completed" | "failed";
		synthesis: string | null;
		triggerTaskId: string | null;
		createdAt: string;
		updatedAt: string;
		completedAt: string | null;
	}
}
```

For long-running/retry-prone research, `triggerTaskId` is populated.

## `GET /api/v1/research`

### Query

```text
?limit=20&cursor=...
```

### Returns

```ts
{
  items: ResearchSummary[];
  nextCursor: string | null;
}
```

## `GET /api/v1/research/:researchId`

### Returns

```ts
{
  research: Research;
  sources: Array<{
    id: string;
    url: string | null;
    title: string | null;
    snippet: string | null;
    fetchedAt: string | null;
    createdAt: string;
  }>;
  angles: Angle[];
  contents: ContentSummary[];
}
```

## `GET /api/v1/research/:researchId/sources`

### Returns

```ts
{
  items: ResearchSource[];
}
```

## `GET /api/v1/research/:researchId/angles`

### Returns

```ts
{
  items: Angle[];
}
```

---

# 19. Discovery

Discovery has two schema layers:

```text
discovery_item
user_discovery_item
```

`discovery_item` is global/unowned.

`user_discovery_item` contains personalized interaction state:

```text
relevanceScore
seenAt
savedAt
dismissedAt
```

## `GET /api/v1/discovery`

### Query

```text
?limit=20&cursor=...
&category=<category>
&saved=true|false
```

### Returns

```ts
{
	items: Array<{
		id: string;
		title: string;
		summary: string;
		whyItMatters: string | null;
		category: string;
		sourceUrl: string | null;
		sourceName: string | null;
		suggestedAngles: string[] | null;
		publishedAt: string | null;
		ingestedAt: string;
		archivedAt: string | null;
		relevanceScore: number | null;
		seenAt: string | null;
		savedAt: string | null;
		dismissedAt: string | null;
	}>;
	nextCursor: string | null;
}
```

Archived items should not normally appear in the active feed.

## `GET /api/v1/discovery/:discoveryItemId`

### Returns

The global Discovery item plus the authenticated user's personalization state.

## `POST /api/v1/discovery/:discoveryItemId/seen`

### Accepts

```ts
{
}
```

### Returns

```ts
{
	seenAt: string;
}
```

## `POST /api/v1/discovery/:discoveryItemId/save`

### Accepts

```ts
{
}
```

### Returns

```ts
{
	savedAt: string;
}
```

## `DELETE /api/v1/discovery/:discoveryItemId/save`

### Returns

```ts
{
	savedAt: null;
}
```

## `POST /api/v1/discovery/:discoveryItemId/dismiss`

### Accepts

```ts
{
}
```

### Returns

```ts
{
	dismissedAt: string;
}
```

## `DELETE /api/v1/discovery/:discoveryItemId/dismiss`

### Returns

```ts
{
	dismissedAt: null;
}
```

## `POST /api/v1/discovery/:discoveryItemId/create-content`

### Accepts

```ts
{
	includeDiscoveryContext: true;
}
```

### Returns

```ts
{
	content: Content;
}
```

Discovery context is explicitly opted into and the resulting Content keeps its discovery traceability.

---

# 20. Notifications

Schema entities:

- `notification`
- `notification_preference`

Notification types currently contain:

```text
consistency_reminder
```

Email status:

```text
not_applicable
sent
failed
```

## `GET /api/v1/notifications`

### Query

```text
?unreadOnly=true|false
&limit=20
&cursor=...
```

### Returns

```ts
{
	items: Array<{
		id: string;
		type: "consistency_reminder";
		title: string;
		body: string;
		readAt: string | null;
		emailStatus: "not_applicable" | "sent" | "failed";
		emailSentAt: string | null;
		createdAt: string;
	}>;
	nextCursor: string | null;
}
```

Do not expose internal delivery implementation details beyond the schema's intended status.

## `POST /api/v1/notifications/:notificationId/read`

### Returns

```ts
{
	notification: Notification;
}
```

## `POST /api/v1/notifications/read-all`

### Returns

```ts
{
	updated: number;
}
```

## `GET /api/v1/notification-preferences`

### Returns

```ts
{
	consistencyRemindersEnabled: boolean;
	inactivityThresholdDays: number;
	emailEnabled: boolean;
	marketingEmailsEnabled: boolean;
}
```

Do not expose `lastReminderSentAt` or `lastReminderForActivityAt` as client-controlled fields.

## `PATCH /api/v1/notification-preferences`

### Accepts

```ts
{
  consistencyRemindersEnabled?: boolean;
  inactivityThresholdDays?: number;
  emailEnabled?: boolean;
  marketingEmailsEnabled?: boolean;
}
```

### Returns

The preference shape above.

---

# 21. Early-access signup

`early_access` is a separate public table and does not have a user FK.

## `POST /api/v1/early-access`

**Public**

### Accepts

```ts
{
	email: string;
}
```

### Returns

```ts
{
	joined: true;
}
```

The email must be unique. A duplicate should return a stable conflict response, for example:

```text
409 CONFLICT
EARLY_ACCESS_ALREADY_REGISTERED
```

---

# 22. History

There is no dedicated `history` table in the uploaded schema.

Therefore history should be a **read model composed from existing entities**, not a new persistence model introduced by the API contract.

## `GET /api/v1/history`

### Query

```text
?limit=20
&cursor=...
&platform=linkedin|x
```

### Returns

```ts
{
  items: HistoryItem[];
  nextCursor: string | null;
}
```

`HistoryItem` should be composed from the relevant Content, Composition, Draft, AI Generation, and Publication records required by the UI.

Do not create a `history` table merely to support this endpoint without an explicit schema decision.

---

# 23. Trigger.dev boundary

Trigger.dev is appropriate for:

- scheduled publishing
- immediate publishing when durable retry/backoff is required
- proactive consistency reminders
- discovery ingestion/processing
- long-running research

Trigger tasks call the same domain services as the synchronous application.

Task inputs should reference durable records:

```ts
{
	publicationId: string;
}
```

rather than copying mutable Draft state.

For scheduled publishing, the task reads the immutable Publication `snapshot`.

---

# 24. External provider error normalization

Provider-specific errors must be converted into SkillTrail errors.

Publication failure reasons are:

```text
account_disconnected
platform_error
rate_limited
validation_error
unknown
```

Example:

```json
{
	"success": false,
	"error": {
		"code": "PROVIDER_ERROR",
		"message": "The publication could not be completed.",
		"details": {
			"failureReason": "rate_limited"
		}
	}
}
```

Never expose raw provider response bodies, OAuth credentials, access tokens, refresh tokens, or internal provider diagnostics.

---

# 25. Stable domain/API error codes

Recommended V1 codes:

```text
BAD_REQUEST
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
RATE_LIMITED
PROVIDER_ERROR
INTERNAL_ERROR
SERVICE_UNAVAILABLE
```

Only add a new stable error code when it represents behavior the client needs to distinguish.

---

# 26. Ownership enforcement

Every resource-by-ID route must verify ownership from the authenticated session.

Examples:

```text
user
 ├── content
 │    └── composition
 │         └── draft
 │              └── ai_generation
 ├── media
 ├── research
 ├── publication
 ├── social_connection
 └── notification
```

The API should re-derive ownership through the relevant FK chain.

If the resource exists but belongs to another user:

```http
404 Not Found
```

Do not reveal that another user's resource exists.

Global discovery items are the exception: the item itself is unowned, while `user_discovery_item` is owned by the current user.

---

# 27. Contract-level invariants

The API must preserve the schema/domain invariants:

1. Exactly one Draft exists per `(compositionId, platform)`.
2. Composition does not own a platform; Draft does.
3. X thread text is stored in `x_thread_post`, not `draft.bodyText`.
4. X thread positions are unique within a Draft.
5. AI generation history belongs to a Draft.
6. Content understanding and angle generation do not create Draft AI-generation history.
7. An AI proposal must be explicitly accepted or rejected.
8. A pending AI proposal blocks normal manual Draft edits.
9. Rejected AI generations remain in history.
10. AI generations are not user-deletable.
11. Restoring an older AI generation does not delete newer history.
12. Cross-Composition restoration creates a new Composition.
13. A Publication is separate from the mutable Draft.
14. Publication `snapshot` is immutable approved publish state.
15. Editing a Draft after scheduling does not modify its snapshot.
16. A scheduled Publication must not be created while an AI proposal is pending.
17. Cancelling a Publication leaves the Draft and Content intact.
18. Deleting an external social post does not delete local SkillTrail content.
19. Deleting local Content does not delete an external social post.
20. Content deletion is blocked by the schema's restrictive Publication relationship when a publication still exists in the composition tree.
21. Social OAuth tokens never reach client code.
22. A social connection may be disconnected without deleting its remembered account record.
23. Deleting a social connection record does not delete the external social account.
24. Discovery items are global; user interaction state lives in `user_discovery_item`.
25. Custom technologies are globally de-duplicated suggestions.
26. Media is reusable and can independently be used as Content context and Draft publishing media.
27. Draft media has ordering; Content context media does not.
28. Trigger.dev tasks reference durable records and reuse domain services rather than duplicating domain rules.
29. API routes do not bypass domain services with ad-hoc business logic.
30. All successful application responses use `success: true`.
31. All application errors use `success: false`.
32. Internal exceptions are normalized into the standard error envelope.

---

# 28. Typical route-handler implementation

A route should look conceptually like:

```ts
export async function POST(request: Request) {
	return withApiHandler(request, async ({ user }) => {
		const input = validateBody(request, CreateCompositionInput);

		const composition = await compositionService.create({
			userId: user.id,
			contentId: input.contentId,
			angleId: input.angleId ?? null,
		});

		return composition;
	});
}
```

The route handler should **not** own:

- complex Drizzle queries
- ownership policy duplicated across routes
- AI provider calls
- LinkedIn/X publishing logic
- response envelope construction
- provider-specific error translation
- publication snapshot rules

Those belong in the appropriate application/domain/integration layer.

---

# 29. Implementation order

Recommended implementation sequence:

1. API response/error/validation
2. Profile + technology/interest management
3. Content + context media
4. Content understanding + angles
5. Composition
6. Draft CRUD
7. X thread/external-post support
8. AI generation/review/history
9. Media upload/library
10. Social connections/OAuth
11. Preview/verification
12. Publications + immutable snapshots
13. Research
14. Discovery + personalization
15. Notifications/preferences
16. Early-access
17. History read model

This follows the actual schema/domain dependency graph instead of treating every table as an isolated CRUD resource.

---

# 30. Schema authority rule

The uploaded Drizzle schema and `relations.ts` are authoritative for persistence.

This API contract must not silently introduce:

- new database tables
- new columns
- new enums
- new foreign keys
- new relations

If an API requirement needs persistence that the schema does not currently support, mark it as a schema/domain change and review it separately.

The API contract describes the HTTP boundary; it does not override the database schema.
