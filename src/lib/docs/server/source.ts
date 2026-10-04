import { readFile } from "node:fs/promises";
import path from "node:path";
import Prism from "prismjs";
import "prismjs/components/prism-typescript.js";
import "prism-svelte";
import { toSlug } from "#lib/core/content-paths.js";
import { getRawMarkdownBySlug } from "#lib/server/content.js";
import { loadExampleSource } from "../examples.js";

const LANGUAGES: Record<string, string> = {
	svelte: "svelte",
	ts: "typescript",
	js: "javascript",
	css: "css",
	json: "json",
	html: "markup",
};

const languageFor = (file: string) => LANGUAGES[file.split(".").pop() ?? ""];

const escapeHtml = (code: string) =>
	code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Prism HTML with the same token classes as the svocs code fences. */
export const highlightCode = (code: string, language?: string) => {
	const grammar = language ? Prism.languages[language] : undefined;
	const body = grammar ? Prism.highlight(code, grammar, language!) : escapeHtml(code);
	return `<pre class="language-${language ?? "text"}"><code class="language-${language ?? "text"}">${body}</code></pre>`;
};

/** Reads a project file at build time. Pages are prerendered from the project root. */
const readSource = async (relativePath: string) => {
	try {
		return await readFile(path.join(process.cwd(), relativePath), "utf-8");
	} catch {
		return null;
	}
};

const entries = async <T>(keys: string[], read: (key: string) => Promise<T>) => {
	const pairs = await Promise.all(keys.map(async (key) => [key, await read(key)] as const));
	return Object.fromEntries(pairs) as Record<string, T>;
};

const PREVIEW_NAME = /<ComponentPreview\b[^>]*?\bname=["']([^"']+)["']/g;
const SOURCE_PATH = /<ComponentSource\b[^>]*?\bpath=["']([^"']+)["']/g;

const collect = (raw: string, pattern: RegExp) => [
	...new Set(Array.from(raw.matchAll(pattern), (match) => match[1])),
];

/**
 * The examples and source files a docs page shows, so its load function can
 * prepare them before the page renders: preview names, and highlighted code
 * for each preview's Code tab and each `<ComponentSource>`.
 */
export const loadDocAssets = async (slugParts: string[]) => {
	const raw = getRawMarkdownBySlug(slugParts) ?? "";
	const previewNames = collect(raw, PREVIEW_NAME);
	const [previewCode, sourceCode] = await Promise.all([
		entries(previewNames, async (name) => {
			const source = await loadExampleSource(name);
			return source === undefined ? null : highlightCode(source, "svelte");
		}),
		entries(collect(raw, SOURCE_PATH), async (file) => {
			const source = await readSource(file);
			return source === null ? null : highlightCode(source.replace(/\n+$/, ""), languageFor(file));
		}),
	]);
	return { previewNames, previewCode, sourceCode, seo: getDocSeo(slugParts) };
};

interface SeoMetadata {
	seoTitle?: string;
	seoDescription?: string;
}

const pageMetadata = import.meta.glob<SeoMetadata | undefined>("/content/**/*.{md,svx}", {
	eager: true,
	import: "metadata",
});

const seoBySlug = new Map(
	Object.entries(pageMetadata).map(([file, metadata]) => [toSlug(file), metadata ?? {}])
);

/** Search-result title and description overrides from a page's frontmatter. */
export const getDocSeo = (slugParts: string[]): SeoMetadata => {
	const { seoTitle, seoDescription } = seoBySlug.get(slugParts.join("/")) ?? {};
	return { seoTitle, seoDescription };
};
