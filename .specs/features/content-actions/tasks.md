# Tasks — content-actions

- [x] 1. Extend `lib/schemas/enums.ts` (add `contentOriginSchema`); create `lib/schemas/content.ts` with all action input schemas — touches: `lib/schemas/enums.ts`, `lib/schemas/content.ts` — tests: none (types/schemas only)
- [x] 2. Create `lib/domain/content-service.ts` — CRUD operations: `create`, `update`, `delete`, `addContextMedia`, `removeContextMedia` — touches: `lib/domain/content-service.ts` — tests: unit — depends on 1
- [x] 3. Create `features/content/queries.ts` — `getContentList`, `getContent` plain async functions — touches: `features/content/queries.ts` — tests: unit — depends on 2
- [x] 4. Create `features/content/actions.ts` — R1–R6 thin action wrappers (CRUD + context-media) — touches: `features/content/actions.ts` — tests: none (thin adapter) — depends on 1, 2
- [x] 5. Write unit tests for `lib/domain/content-service.ts` CRUD operations — touches: `tests/unit/domain/content-service.test.ts` — tests: unit — depends on 2
- [ ] 6. Create `lib/ai/provider.ts` stub; implement `contentService.understand` and `contentService.generateAngles` in `lib/domain/content-service.ts` — touches: `lib/ai/provider.ts`, `lib/domain/content-service.ts` — tests: unit — depends on 2
- [ ] 7. Add R7 (`analyzeContent`) and R8 (`generateAngles`) to `features/content/actions.ts` — touches: `features/content/actions.ts` — tests: none (thin adapter) — depends on 6
- [ ] 8. Write unit tests for `understand` and `generateAngles` domain functions — touches: `tests/unit/domain/content-service.test.ts` — tests: unit — depends on 6
