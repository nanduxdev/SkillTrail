/**
 * Seed script — populates pre-defined technologies and interests.
 * Run with: bun db/seed.ts
 *
 * Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING so existing rows
 * are not touched and duplicates are silently skipped.
 */

import { db } from ".";
import { interest, technology } from "./schema/profile";

const TECHNOLOGIES = [
	// Languages
	"TypeScript",
	"JavaScript",
	"Python",
	"Go",
	"Rust",
	"Java",
	"Kotlin",
	"Swift",
	"C#",
	"C++",
	"Ruby",
	"PHP",
	"Elixir",
	// Frontend
	"React",
	"Next.js",
	"Vue",
	"Nuxt",
	"Svelte",
	"SvelteKit",
	"Angular",
	"Tailwind CSS",
	"CSS",
	"HTML",
	// Backend
	"Node.js",
	"Bun",
	"Deno",
	"Express",
	"Fastify",
	"NestJS",
	"Django",
	"FastAPI",
	"Rails",
	"Laravel",
	"Spring Boot",
	// Databases
	"PostgreSQL",
	"MySQL",
	"SQLite",
	"MongoDB",
	"Redis",
	"Supabase",
	"PlanetScale",
	"Neon",
	"Drizzle ORM",
	"Prisma",
	// Cloud & Infrastructure
	"AWS",
	"Google Cloud",
	"Azure",
	"Vercel",
	"Cloudflare",
	"Docker",
	"Kubernetes",
	"Terraform",
	"GitHub Actions",
	// AI & ML
	"LLMs",
	"Prompt Engineering",
	"LangChain",
	"OpenAI API",
	"Hugging Face",
	"PyTorch",
	"TensorFlow",
	// Mobile
	"React Native",
	"Flutter",
	"iOS",
	"Android",
	// Tools
	"Git",
	"Linux",
	"Vim",
	"GraphQL",
	"REST APIs",
	"WebSockets",
	"gRPC",
];

const INTERESTS = [
	// Engineering areas
	"Web Development",
	"Mobile Development",
	"Backend Development",
	"Frontend Development",
	"Full-Stack Development",
	"DevOps",
	"Platform Engineering",
	"Site Reliability",
	"Security",
	"Systems Programming",
	// Data & AI
	"AI & Machine Learning",
	"Data Engineering",
	"Data Science",
	"MLOps",
	// Career & Community
	"Career Growth",
	"Tech Leadership",
	"Engineering Management",
	"Open Source",
	"Developer Tools",
	"Indie Hacking",
	"Startups",
	"Technical Writing",
	"Developer Advocacy",
	// Specializations
	"Distributed Systems",
	"API Design",
	"Performance Optimization",
	"Accessibility",
	"Developer Experience",
	"Databases",
	"Cloud Architecture",
];

async function seed() {
	console.log("Seeding technologies...");
	await db
		.insert(technology)
		.values(TECHNOLOGIES.map((name) => ({ name })))
		.onConflictDoNothing();

	console.log("Seeding interests...");
	await db
		.insert(interest)
		.values(INTERESTS.map((name) => ({ name })))
		.onConflictDoNothing();

	console.log(
		`✓ Seeded ${TECHNOLOGIES.length} technologies, ${INTERESTS.length} interests.`,
	);
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
