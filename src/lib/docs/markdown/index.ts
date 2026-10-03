import { mdsvex } from "mdsvex";
import type { PreprocessorGroup } from "svelte/compiler";
import { highlightCodeBlock } from "./highlight.ts";
import { rehypeBaseLinks } from "./rehype-base-links.ts";
import { rehypeHeadings } from "./rehype-headings.ts";
import { rehypeTables } from "./rehype-tables.ts";
import { remarkDocs } from "./remark-docs.ts";

export const MARKDOWN_EXTENSIONS = [".md", ".svx"];

const isMarkdown = (filename?: string) =>
	!!filename && MARKDOWN_EXTENSIONS.some((extension) => filename.endsWith(extension));

/** mdsvex still writes `context="module"`, which runes mode deprecates. */
const moduleScript: PreprocessorGroup = {
	name: "docs-module-script",
	markup: ({ content, filename }) =>
		isMarkdown(filename)
			? { code: content.replace(/<script context="module">/g, "<script module>") }
			: undefined,
};

/** The Svelte preprocessors for docs pages: mdsvex with the docs plugins and shiki. */
export const docsPreprocess = (): PreprocessorGroup[] => [
	mdsvex({
		extensions: MARKDOWN_EXTENSIONS,
		smartypants: false,
		remarkPlugins: [remarkDocs as never],
		rehypePlugins: [
			rehypeHeadings as never,
			rehypeTables as never,
			rehypeBaseLinks(process.env.VITE_BASE_PATH ?? "") as never,
		],
		highlight: { highlighter: highlightCodeBlock },
	}) as PreprocessorGroup,
	moduleScript,
];
