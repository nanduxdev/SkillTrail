## Prompt for Cursor Agent

> Refactor form validation in this codebase to use Zod while keeping the public form API unchanged.
>
> **Goal:** Centralize validation in Zod schemas; remove ad-hoc validation logic. External components must keep the same props, callbacks, and error shape they use today.
>
> **Requirements:**
> - Read existing form components and validation before editing
> - Extract schemas to `lib/validation/` (or match existing lib patterns)
> - Use `zod` + existing resolver pattern if react-hook-form is present
> - Preserve current error messages and field names exposed to parents
> - TypeScript strict; no `any` in public types
>
> **Verify:** All existing form tests pass; manual submit with invalid/valid data behaves identically.
>
> **Out of scope:** Changing form UI, adding new fields, changing server API contracts.

---

**Target:** Cursor / IDE coding agent  
**Task type:** refactor  
**Assumptions:** Forms already exist; Zod may need installing  
**Tips:** @-mention form components and test files; run test suite after changes.
