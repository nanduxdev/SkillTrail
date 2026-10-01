import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": rootDir,
			"next/headers": path.join(rootDir, "tests/mocks/next-headers.ts"),
		},
	},
	test: {
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
		server: {
			deps: {
				inline: ["@next-safe-action/adapter-better-auth", "next-safe-action"],
			},
		},
	},
});
