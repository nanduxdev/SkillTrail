Here's how I'd explain Server Actions to a junior dev on your team — you can adapt this for a Slack message, doc, or pairing session.

---

**What are Server Actions?**

Server Actions are async functions that run on the server but can be called directly from your React components — usually from a form's `action` prop or by importing and invoking them in client code (with `"use server"` at the top of the file or function).

Think of them as "server endpoints without writing a separate API route." Next.js wires up the network call for you.

**Why use them?**

- You keep database/API secrets on the server (never in the browser)
- Less boilerplate than `fetch('/api/...')` for simple mutations
- Works naturally with forms and progressive enhancement

**Mental model**

```
Browser form submit → Next.js sends data to server → your function runs → returns result to client
```

The function lives in a file marked `"use server"`. It can read/write to your DB, call external APIs, validate input, etc.

**Minimal example**

```tsx
// app/actions.ts
"use server";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email");
  // validate, save to DB...
  return { success: true };
}
```

```tsx
// app/page.tsx
import { joinWaitlist } from "./actions";

export default function Page() {
  return (
    <form action={joinWaitlist}>
      <input name="email" type="email" required />
      <button type="submit">Join</button>
    </form>
  );
}
```

**Key things juniors often miss**

1. **`"use server"`** — required on the function or file so Next knows it runs server-side
2. **Serializable arguments** — you can't pass functions or class instances from client to server; stick to plain objects, FormData, strings, numbers
3. **Revalidation** — after a mutation, you may need `revalidatePath()` or `revalidateTag()` so the UI reflects new data
4. **Not a replacement for all APIs** — public REST APIs, webhooks, and third-party integrations still need route handlers

**When to reach for something else**

- You need a public HTTP API → use Route Handlers (`app/api/...`)
- Heavy real-time or polling → consider other patterns
- Complex client-side state before submit → combine with client components + `useTransition`

**Good first exercise:** refactor an existing `fetch` to a waitlist or contact form into a Server Action and compare the code size.

---

If you want this as a prompt for an AI to generate a tutorial, say the junior knows React but is new to Next.js App Router, and ask for a side-by-side comparison with the old `pages/api` pattern.
