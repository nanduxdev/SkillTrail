# SkillTrail — Architecture

## System Shape

One Next.js application + managed Trigger.dev background execution.

There is no separate backend service, no separate worker process, no Redis, no BullMQ, no monorepo, no microservice split.

```
Browser → Next.js App (App Router)
              ├── Server Components
              ├── Server Actions
              ├── Route Handlers
              └── OAuth callbacks / webhooks
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
    Neon PostgreSQL   Cloudflare R2  Trigger.dev Tasks
    + Drizzle ORM     (media)              │
                                   ┌──────┼──────┐
                                   ▼      ▼      ▼
                              LinkedIn   X API  AI provider
```

Trigger.dev tasks execute outside the request/response lifecycle but use the same domain contracts and database as the Next.js application.

---

## Technology Stack (Locked for V1)

| Layer                | Choice                                             |
| -------------------- | -------------------------------------------------- |
| Runtime              | Bun (local + package manager)                      |
| Framework            | Next.js 16 App Router                              |
| Language             | TypeScript, strict mode, ESM                       |
| UI                   | Tailwind CSS v4 + shadcn/ui                        |
| Database             | Neon PostgreSQL                                    |
| ORM                  | Drizzle ORM + Drizzle Kit                          |
| Auth                 | Better Auth (email/password + Google + username)   |
| AI                   | Vercel AI SDK + Google Gemini (default, free tier) |
| Background execution | Trigger.dev                                        |
| Object storage       | Cloudflare R2                                      |
| Validation           | Zod                                                |
| Testing              | Vitest                                             |
| Lint/format          | prettier and eslint                                |
| Hosting              | Vercel                                             |

**Deployment portability rule:** Domain/business logic must not depend on Bun-only APIs. This matters especially for Trigger.dev tasks, which must call portable TypeScript modules, not the Bun runtime directly.

Do not introduce a new framework, backend service, CSS system, state-management library, animation library, or infrastructure without a concrete reason and explicit approval.

---

## Application Boundaries

### Next.js handles (synchronous request/response work):

- Authentication and session management
- Onboarding, profile CRUD
- Social OAuth initiation and callback handling
- Draft, Content, Media CRUD
- Interactive AI operations (content understanding, angle generation, draft generation, AI editing, AI review/accept/reject)
- Preview generation
- Scheduling and publication commands
- User-facing reads (history, drafts, discovery feed)

### Trigger.dev handles (durable/background/scheduled work):

- Scheduled publishing
- Immediate publishing with retry/backoff
- Proactive consistency notifications
- Background discovery-feed ingestion/processing
- Long-running or failure-prone research operations

**Rule:** Use Trigger.dev because the operation benefits from durable/background execution — not because asynchronous infrastructure is technically interesting. Draft CRUD, profile updates, auth, preview rendering, and interactive AI generation stay synchronous.

---

## AI Architecture

All AI model calls go through a thin internal interface. The rest of SkillTrail must not directly depend on Gemini-specific SDK calls.

Conceptual interface:

```ts
interface AiProvider {
	understandContent(input: RawMaterial): Promise<ContentUnderstanding>;
	generateAngles(input: ContentUnderstanding): Promise<Angle[]>;
	generateDraft(input: DraftGenerationInput): Promise<GeneratedDraft>;
	editDraft(input: DraftEditInput): Promise<GeneratedDraft>;
	researchTopic(input: ResearchInput): Promise<ResearchSynthesis>;
	understandImage(input: ImageInput): Promise<ImageUnderstanding>;
}
```

This allows swapping or supplementing AI providers without touching Content/Composition/Draft/Publication logic.

**V1 default:** Gemini via Google AI provider via Vercel AI SDK, using free tier.
**Why:** Validate actual AI workload (prompts, volume, latency/quality needs) before spending on inference infrastructure.
**Self-hosting:** Remains a valid future path when free-tier limits are consistently hit or a specific capability needs an open-source model. That decision requires real usage data.

Every AI call that participates in the product must produce a generation record (see `ai_generation` table) sufficient for provider, model, operation, status, latency, token usage, owning user/draft, and creation time.

---

## Domain Layer Rule

Domain/business logic stays outside UI components, Server Actions, and Route Handlers. Server Actions and remaining Route Handlers are thin adapters over `lib/domain`.

Trigger.dev tasks call the same domain services rather than duplicating logic, and must not invoke Server Actions or SkillTrail HTTP endpoints. The domain layer is the shared contract between the web application and background tasks.

---

## Auth Architecture

**Application auth** (logging into SkillTrail): Better Auth — email/password, Google, username.

**Social connections** (publishing to LinkedIn/X): `social_connection` table — entirely separate from Better Auth's `account` table. Social OAuth tokens must never be exposed to client code.

Better Auth owns `/api/v1/auth/*` entirely. No SkillTrail route should be added under that prefix.

---

## Important Constraints

**One active Draft per platform per Composition.** Enforced by unique constraint `(composition_id, platform)` on the `draft` table.

**Publication owns an immutable snapshot at scheduling time.** The mutable Draft and the approved scheduled snapshot evolve independently. Draft edits do not silently change a scheduled publication.

**Content deletion is blocked while a live Publication exists in its composition tree.** Enforced by `RESTRICT` foreign key from `publication.composition_id` to `composition.id`.

**Ownership enforcement on every resource read.** Every resource-by-id route re-derives ownership by walking the FK chain to the session's `user_id`. A resource that exists but isn't owned by the caller returns 404 (not 403).

**No public social-network layer in V1.** SkillTrail does not have public user profiles or a social feed. Username exists for authentication, not public display.

---

## Schema Authority

The Drizzle schema (`db/schema/*.ts`) and relations (`db/relations.ts`) are the source of truth for current implementation.

Do not modify the V1 schema as part of ordinary work (landing page, UI tweaks, etc.). Schema changes require explicit justification and review.

---

## Validation Commands

```bash
bun dev           # start dev server
bun run typecheck # TypeScript check
bun run lint      # es lint
bun run test      # Vitest
bun run db:push   # push schema to Neon (dev only)
```
