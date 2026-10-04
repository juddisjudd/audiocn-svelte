/** Files copied from the svocs template keep its style, so `svocs update` can still patch them. */
const SVOCS_FILES = [
	"src/env.ts",
	"src/virtual.d.ts",
	"src/lib/site.ts",
	"src/lib/{build,core,icons,search,server,themes,types}/**",
	"src/lib/components/[A-Z]*.svelte",
	"src/routes/docs/**",
	"src/routes/{llms.txt,llms-full.txt,search-index.json,sitemap.xml}/**",
	"scripts/{og,search}/**",
];

/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: false,
	trailingComma: "es5",
	printWidth: 100,
	plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	overrides: [
		{ files: "*.svelte", options: { parser: "svelte" } },
		{ files: SVOCS_FILES, options: { singleQuote: true, trailingComma: "none" } },
	],
	tailwindStylesheet: "./src/routes/layout.css",
};

export default config;
