import type { DocPage, FolderMeta, NavItem } from "./types.js";

const SEPARATOR = /^---(.*)---$/;
const EXTRACT = /^\.\.\.(.+)$/;

const join = (folder: string, name: string) => {
	const path = folder ? `${folder}/${name}` : name;
	return path === "index" ? "" : path.replace(/\/index$/, "");
};

/**
 * Builds the sidebar from the `meta.json` files, with the same rules as
 * Fumadocs: `---Title---` is a separator, `...folder` inlines a folder's
 * pages, and other entries are page paths. Pages that do not exist yet are
 * left out, so the sidebar fills in as pages are added.
 */
export const buildNav = (
	pages: Map<string, DocPage>,
	metas: Map<string, FolderMeta>,
	folder = ""
): NavItem[] => {
	const meta = metas.get(folder);
	if (!meta) {
		return [];
	}
	const items: NavItem[] = [];
	for (const entry of meta.pages) {
		const separator = entry.match(SEPARATOR);
		const extract = entry.match(EXTRACT);
		if (separator) {
			items.push({ type: "separator", title: separator[1] });
		} else if (extract) {
			items.push(...buildNav(pages, metas, join(folder, extract[1])));
		} else {
			const page = pages.get(join(folder, entry));
			if (page) {
				items.push({ type: "page", title: page.title, href: page.href });
			}
		}
	}
	return items;
};

/** The pages in sidebar order, for previous and next links. */
export const navPages = (nav: NavItem[]) =>
	nav.filter((item): item is Extract<NavItem, { type: "page" }> => item.type === "page");

const CONTENT_ROOT = "/src/content/docs/";

/** `/src/content/docs/components/index.md` → `components`. */
export const slugFromPath = (path: string) =>
	path
		.slice(CONTENT_ROOT.length)
		.replace(/\.md$/, "")
		.replace(/(^|\/)index$/, "");

export const hrefFromSlug = (slug: string) => (slug ? `/docs/${slug}` : "/docs");

/** Drops separators with no pages under them, such as sections still being written. */
export const pruneSeparators = (nav: NavItem[]) =>
	nav.filter((item, index) => item.type !== "separator" || nav[index + 1]?.type === "page");
