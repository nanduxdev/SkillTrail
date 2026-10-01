# Analysis — server-actions-migration

## Contradictions

- Contract folder sketch uses root `domain/`; the repo and `docs/architecture.md` use `lib/domain/`. **Resolution:** keep `lib/domain/`.
- Contract Resolved Assumptions §1 constructs `AppError` with an HTTP status; §3.1 does not. **Resolution:** follow §3.1 (no status).
- Contract sample uses `createSafeActionClient<AppServerError>`; next-safe-action v8 infers `ServerError` from `handleServerError`'s return type. **Resolution:** type via `handleServerError` return annotation; do not force an invalid generic.
- Profile catalog GETs currently return the full list; contract §8 is `search*` with optional `query`. **Resolution:** empty/omitted query = full catalog; non-empty query filters by name.

## Gaps

- Existing HTTP profile tests mock the domain layer, so replace/unknown-ID/auto-create behaviors listed in profile tasks are not actually asserted. Migration tests must cover those at the domain layer plus transport at the action layer.
- `setMarketingEmailPreferenceAction` has no UI consumer. Still migrate it so `lib/actions.ts` can be removed without leaving Drizzle in the action file.

## Ambiguities requiring a decision

None remaining — all listed items resolved in the approved implementation plan.

## Resolution

- [x] closed by documenting resolutions above and the approved plan
- [ ] escalated — waiting on developer
