<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CommitStory - Agent Instructions

Welcome to the CommitStory project! As an AI agent working on this codebase, your primary goal is to help build out the initial version of the product.

## Current Project Phase: "Coming Soon" Landing Page
At this stage, we are developing a **"Coming Soon" landing page** to capture early interest. The schema and core application logic are still being finalized, so **do not build or reference any complex database schemas or application data structures** unless explicitly instructed by the user.

Your tasks will primarily revolve around building a stunning, premium frontend experience and a simple backend to capture user sign-ups.

### 1. The Landing Page Experience
- **Goal:** Create a visually striking "Coming Soon" page that lists our features and offerings.
- **Design Aesthetics:** The design must be modern, vibrant, and premium (e.g., sleek dark modes, dynamic animations, smooth gradients). The user should be wowed at first glance.
- **Micro-interactions:** Add subtle hover effects, scroll-driven animations, and view transitions to make the page feel alive.
- **Content:** The landing page should highlight the core value propositions of CommitStory (derived from our specs):
  - **AI-Assisted Content Creation:** Turn raw ideas, research, or discoveries into engaging posts with customized tone, technical depth, and emoji usage.
  - **Multi-Platform Publishing:** Seamlessly draft, schedule, and publish content to LinkedIn and X (Twitter), including X threads and self-replies.
  - **Smart Personalization:** Maintain a consistent voice with custom technologies, interests, and free-form writing instructions.
  - **AI History & Versioning:** Never lose a good idea. Access your full AI generation history and easily undo or restore previous drafts.
  - **Consistency & Discovery:** Stay on track with proactive consistency reminders and global content discovery tailored to your profile.

### 2. Call to Action (CTA): Founding Users List
- **Primary Action:** The main CTA should invite users to join our early access list and become a "Founding User".
- **Form Elements:** Keep it simple—ask for Email and optionally Name/Username.
- **Backend Integration:** We need a simple backend mechanism (e.g., Next.js API route, Server Action, or basic DB integration) to save these early sign-ups. When building this, focus only on saving the user's contact information for the waitlist.

## General Guidelines
- **Framework:** We are using Next.js. Adhere strictly to the Next.js App Router conventions and best practices.
- **Styling:** Use Vanilla CSS or the established styling solution to create rich aesthetics. Prioritize visual excellence and avoid generic layouts.
- **Code Quality:** Ensure all interactive elements have unique, descriptive IDs. Follow SEO best practices automatically (Title tags, Meta descriptions, Semantic HTML).
- **No Domain Schema Work Yet:** Do not assume or build complex domain schemas (e.g., Drafts, Publications, Social Connections). The schema is NOT fixed yet. Focus solely on the landing page and the waitlist functionality.
## UI Quality Gate

A UI is not complete merely because it compiles.

Before finishing a UI task, evaluate:

### Visual
- Does it have a distinctive visual identity?
- Is the hierarchy obvious within 3 seconds?
- Is the typography intentional?
- Is spacing rhythm consistent?
- Is there a memorable visual motif?
- Does the composition avoid predictable SaaS templates?

### Responsive
- 375px
- 768px
- 1280px+
- no horizontal overflow
- intentional mobile hierarchy

### Interaction
- hover
- focus-visible
- active
- disabled
- loading
- error
- success

### Accessibility
- keyboard navigation
- semantic HTML
- accessible labels
- focus visibility
- reduced motion
- sufficient contrast

### Performance
- avoid unnecessary client components
- avoid expensive animation
- optimize images
- avoid layout shift

### Product specificity
Ask:

"Could this exact UI belong to another random AI SaaS?"

If yes, redesign it.

## Design Quality Loop

For every meaningful UI task:

1. Implement the first design.
2. Run the application.
3. Inspect the rendered result at desktop and mobile sizes.
4. Review the result against:
   - .agents/skills/frontend-design/SKILL.MD
   - .agents/skills/web-design-guidelines/SKILL.MD
   - ./docs/design-direction.md
5. Identify the 5 weakest visual decisions.
6. Fix them.
7. Reinspect the rendered result.
8. Only then consider the task complete.