Here's what I'd tell Cursor to refactor form validation to Zod without changing the public API:

---

**Prompt for Cursor:**

> Refactor our form validation to use Zod without changing the external API.
>
> Requirements:
> - Keep all existing function signatures, return types, and error shapes unchanged — callers should not need updates
> - Replace manual validation logic with Zod schemas
> - Infer TypeScript types from schemas where possible (`z.infer<>`)
> - Preserve current error messages and field-level error mapping behavior
> - If we validate on both client and server, share the same schema between them
> - Do not change route handlers, Server Actions, or component props — only internal validation implementation
> - Add Zod as a dependency if not present
> - Run existing tests; fix any that break only if the old behavior was incorrect
>
> Start by listing each validation entry point and its current input/output contract, then refactor one form at a time.

---

**Why this works:**

- **"Without changing the API"** is explicit — Cursor won't rename exports or reshape responses
- **Error shape preservation** matters if your UI maps `errors.email` etc.
- **One form at a time** keeps diffs reviewable
- **Share schemas** avoids client/server drift

**Optional additions** if relevant to your codebase:

- "Use `safeParse` and map `ZodError` to our existing `ValidationError` type"
- "Co-locate schemas in `lib/validation/` or next to the form"
- "Use `zodResolver` from `@hookform/resolvers/zod` if we're on react-hook-form"

Point Cursor at the specific files (`@form-validation.ts`, `@WaitlistForm.tsx`, etc.) for a tighter refactor.
