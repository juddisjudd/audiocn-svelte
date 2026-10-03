import { buildNav, hrefFromSlug, navPages, pruneSeparators, slugFromPath } from "../nav.js";
import type { DocMetadata, DocPage, FolderMeta } from "../types.js";

const metadata = import.meta.glob<DocMetadata>("/src/content/docs/**/*.md", {
	eager: true,
	import: "metadata",
});

const folderMetas = import.meta.glob<FolderMeta>("/src/content/docs/**/meta.json", {
	eager: true,
	import: "default",
});

const metadataBySlug = new Map(
	Object.entries(metadata).map(([path, meta]) => [slugFromPath(path), meta])
);

export const docsPages = new Map<string, DocPage>(
	[...metadataBySlug].map(([slug, meta]) => [
		slug,
		{ slug, href: hrefFromSlug(slug), title: meta.title, description: meta.description ?? "" },
	])
);

const metas = new Map<string, FolderMeta>(
	Object.entries(folderMetas).map(([path, meta]) => [
		slugFromPath(path).replace(/\/?meta\.json$/, ""),
		meta,
	])
);

export const docsNav = pruneSeparators(buildNav(docsPages, metas));

/** Every page in sidebar order, then any page the sidebar does not list. */
export const orderedDocsPages = (() => {
	const pages = [...docsPages.values()];
	const ordered = navPages(docsNav)
		.map((item) => pages.find((page) => page.href === item.href))
		.filter((page): page is DocPage => !!page);
	return [...ordered, ...pages.filter((page) => !ordered.includes(page))];
})();

export const getDocMetadata = (slug: string) => metadataBySlug.get(slug);
