---
trigger: always_on
---

# Domain Logic Must Live in `lib/domain`

Route Handlers are thin HTTP transport adapters.

SkillTrail's architecture requires domain/business logic to stay outside Route Handlers. The domain layer is shared between the Next.js application and Trigger.dev tasks.

## Route Handlers MAY

- Read the HTTP request.
- Read route, path, and query parameters.
- Obtain the authenticated user/session context.
- Parse and validate request input.
- Call a domain service/use case in `lib/domain`.
- Translate domain errors into HTTP responses.
- Return domain results as HTTP responses.
- Handle HTTP-specific status codes and headers.

## Route Handlers MUST NOT

Do not put the following directly in `route.ts`:

- Domain database queries.
- Multi-table queries or relation traversal.
- Business rules.
- Ownership enforcement logic.
- Domain authorization decisions.
- Domain defaults.
- Domain response shaping.
- Entity orchestration.
- Cross-entity validation.
- Create/update/delete workflows.
- State-transition rules.
- AI orchestration.
- Draft/Composition rules.
- Publication/scheduling rules.
- Profile/application-domain logic.
- Any logic that may be reused by Trigger.dev tasks or other application entry points.

If the route starts deciding what SkillTrail should do, that logic belongs in `lib/domain`.

## Required Architecture

Use this dependency direction:

HTTP Route Handler
→ `lib/domain`
→ database / external services

Do not use:

HTTP Route Handler
→ database
→ business logic in the route

For example, prefer:

```ts
export const GET = (request: Request) => {
	return getApplicationProfile({
		userId: ctx.userId,
	});
};
```
