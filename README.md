# SkillTrail

**I know how to build things. I struggled to turn the things I build into stories, a personal brand, and a consistent presence on social media.**

SkillTrail is being built to solve that problem. It is a product built by a developer for developers. The goal is to help developers turn the work they are already doing into stories worth sharing and build a recognizable presence over time.

## Why SkillTrail?
Building software and communicating the value of that work are two different skills. A developer can spend days or weeks building something meaningful and still struggle with:
- Figuring out what is actually worth sharing
- Turning technical work into an interesting story
- Explaining technical work at the right depth
- Maintaining a consistent voice
- Building a recognizable presence over time

SkillTrail helps turn raw ideas, research, discoveries, and development work into engaging posts with customized tone, technical depth, and writing preferences.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Neon PostgreSQL](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Background Jobs**: [Trigger.dev](https://trigger.dev/)
- **Storage**: Cloudflare R2
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) with Gemini as the default provider

## Getting Started

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up environment variables**:
   Copy the `.env.example` file (if available) to `.env.local` and configure your database and API keys.

3. **Push database schema**:
   ```bash
   bun run db:push
   ```

4. **Run the development server**:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Phase
Currently in the **"Coming Soon" landing page phase**, focused on communicating the problem, establishing the product identity, and capturing founding-user signups to help shape the product.
