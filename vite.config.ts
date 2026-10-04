import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { contentDatesPlugin } from "./src/lib/docs/markdown/content-dates.ts";
import { docsPreprocess, MARKDOWN_EXTENSIONS } from "./src/lib/docs/markdown/index.ts";

// The search resolver (src/lib/search/resolver.ts) reads this at build time.
process.env.PUBLIC_SVOCS_SEARCH_PROVIDER ??= "pagefind";

// Set BASE_PATH when deploying under a sub-path, such as BASE_PATH=/audiocn-svelte on GitHub Pages.
const base = process.env.BASE_PATH?.startsWith("/") ? (process.env.BASE_PATH as `/${string}`) : "";

export default defineConfig(({ mode }) => ({
	define: { "import.meta.env.VITE_BASE_PATH": JSON.stringify(base) },
	// Doc pages lazy-load content/ modules in the browser; Vite only serves allow-listed directories in dev.
	server: { fs: { allow: ["content"] } },
	plugins: [
		tailwindcss(),
		contentDatesPlugin(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
			},
			adapter: adapter({ fallback: "404.html" }),
			paths: { base },
			preprocess: docsPreprocess(base),
			extensions: [".svelte", ...MARKDOWN_EXTENSIONS],
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
