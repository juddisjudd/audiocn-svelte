import type { Component } from "svelte";
import type { TocEntry } from "./markdown/rehype-headings.js";

export type { TocEntry };

/** What mdsvex exports as `metadata` from a docs page. */
export interface DocMetadata {
	title: string;
	description?: string;
	seoTitle?: string;
	seoDescription?: string;
	toc?: TocEntry[];
	/** Example names used by `<ComponentPreview>` on the page. */
	previewNames?: string[];
	/** File paths shown by `<ComponentSource>` on the page. */
	sourcePaths?: string[];
}

export interface DocModule {
	default: Component;
	metadata: DocMetadata;
}

export interface DocPage {
	/** Path under `/docs`, without slashes at either end. Empty for the docs index. */
	slug: string;
	href: string;
	title: string;
	description: string;
}

export type NavItem =
	{ type: "separator"; title: string } | { type: "page"; title: string; href: string };

/** A docs folder's `meta.json`, in Fumadocs' format. */
export interface FolderMeta {
	title?: string;
	pages: string[];
}
