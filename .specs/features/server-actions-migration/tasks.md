# Tasks — server-actions-migration

- [x] 1. Shared infra: `lib/errors.ts`, `lib/safe-action.ts`, `lib/schemas/enums.ts`, retarget `lib/schemas/profile.ts` — tests: unit (types)
- [x] 2. Profile queries/actions + domain import/filter; delete profile routes — tests: action + domain — depends on 1
- [x] 3. Early-access + marketing-preference domain/actions; update landing page; delete `lib/actions.ts` — tests: action — depends on 1
- [x] 4. Grep and delete `lib/api/*` when unused — tests: none — depends on 2
- [x] 5. Architecture Domain Layer Rule sentence — tests: none
- [x] 6. `bun run typecheck && bun run lint && bun run test:run` — tests: all — depends on 2, 3, 4
