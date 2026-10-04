import { mdsvex } from "mdsvex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex-svelte";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import type { PreprocessorGroup } from "svelte/compiler";
import { rehypeBasePath } from "../../build/base-path.ts";
import { highlightWithFilename } from "../../build/code-highlighter.ts";
import { rehypeTables } from "./rehype-tables.ts";
import { remarkInstallCommand } from "./remark-install-command.ts";

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

/**
 * The svocs content pipeline (mdsvex, heading anchors, KaTeX, base-path links,
 * Prism with `filename="…"` frames), plus ```npm fences as install commands and
 * tables in a scrolling wrapper.
 * svocs' Obsidian preprocessor is left out: it reads `rows={[[…]]}` in props
 * tables as wikilinks, and this content is not an Obsidian vault.
 */
export const docsPreprocess = (base: string): PreprocessorGroup[] => [
	mdsvex({
		extensions: MARKDOWN_EXTENSIONS,
		// Keeps `--meter-level` and straight quotes intact in prose.
		smartypants: false,
		remarkPlugins: [remarkMath as never, remarkInstallCommand as never],
		rehypePlugins: [
			rehypeSlug as never,
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: { className: ["heading-anchor"], "aria-label": "Section link" },
				},
			] as never,
			rehypeKatex as never,
			rehypeBasePath(base) as never,
			rehypeTables as never,
		],
		highlight: { highlighter: highlightWithFilename, optimise: true },
	}) as PreprocessorGroup,
	moduleScript,
];
