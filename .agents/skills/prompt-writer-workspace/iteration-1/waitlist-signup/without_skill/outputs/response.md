For a coming-soon landing page waitlist, you'll want something simple but polished: a form that collects email (and optionally name), validates input, shows clear success/error states, and persists signups somewhere reliable.

Here's a practical approach you could hand to an AI coding assistant or implement yourself:

**Core requirements**
- Email field (required), name/username (optional)
- Client-side validation (valid email format)
- Server-side validation and duplicate handling
- Success message after signup; don't lose the user on error
- Loading state on submit button
- Accessible labels, focus states, and semantic HTML

**Tech stack suggestion (Next.js)**
- A form component on your landing page
- A Server Action or API route (`POST /api/waitlist`) that saves to a database or service (Supabase, Postgres, Resend audience, etc.)
- Rate limiting or basic spam protection if you're worried about abuse

**UX details that matter**
- Keep the CTA above the fold: "Join the waitlist" or "Get early access"
- Show social proof if you have it ("Join 200+ founders")
- Privacy reassurance: "No spam, unsubscribe anytime"
- Mobile-friendly: large tap targets, no horizontal scroll

**Example prompt you could paste into Cursor:**

> Build a waitlist signup for my coming-soon landing page. Use Next.js App Router with a Server Action. The form should have email (required) and name (optional). Validate on both client and server. Save to [your DB/service]. Show loading, success, and error states. Match a premium dark landing page aesthetic. Include unique IDs on interactive elements and proper accessibility.

Adjust the database/service part to whatever you're actually using. If you share your stack (Next.js version, DB, styling approach), I can narrow this down further.
