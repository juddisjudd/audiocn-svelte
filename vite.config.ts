import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { docsPreprocess, MARKDOWN_EXTENSIONS } from "./src/lib/docs/markdown/index.ts";

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
			},
			adapter: adapter(),
			preprocess: docsPreprocess(),
			extensions: [".svelte", ...MARKDOWN_EXTENSIONS],
			prerender: {
				// Docs pages for components that are still being ported are linked before they exist.
				handleHttpError: ({ path, referrer, message }) => {
					if (path.startsWith("/docs/") && referrer) {
						console.warn(`Missing docs page: ${path} (linked from ${referrer})`);
						return;
					}
					throw new Error(message);
				},
			},
		}),
	],
	resolve: mode === "test" ? { conditions: ["browser"] } : undefined,
	test: {
		expect: { requireAssertions: true },
		environment: "jsdom",
		include: ["src/**/*.test.ts"],
		setupFiles: ["./test/setup.ts"],
	},
}));
