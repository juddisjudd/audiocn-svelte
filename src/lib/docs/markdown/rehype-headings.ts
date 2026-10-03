import { decodeEntities, Slugger } from "./slug.ts";

interface HastNode {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

interface HastFile {
	data: { fm?: Record<string, unknown> };
}

export interface TocEntry {
	id: string;
	text: string;
	depth: number;
}

const DEPTHS: Record<string, number> = { h2: 2, h3: 3 };

const textOf = (node: HastNode): string =>
	node.type === "text"
		? (node.value ?? "")
		: (node.children ?? []).map((child) => textOf(child)).join("");

const containsLink = (node: HastNode): boolean =>
	node.tagName === "a" || (node.children ?? []).some((child) => containsLink(child));

const walk = (node: HastNode, visit: (node: HastNode) => void) => {
	for (const child of node.children ?? []) {
		visit(child);
		walk(child, visit);
	}
};

/**
 * Gives every h2 and h3 a GitHub-style id and a self link, and records them
 * as `toc` in the page metadata for the "On this page" list.
 */
export const rehypeHeadings = () => (tree: HastNode, file: HastFile) => {
	const slugger = new Slugger();
	const toc: TocEntry[] = [];

	walk(tree, (node) => {
		const depth = node.type === "element" && node.tagName ? DEPTHS[node.tagName] : undefined;
		if (!depth) {
			return;
		}
		const text = decodeEntities(textOf(node)).trim();
		const id = slugger.slug(text);
		node.properties = { ...node.properties, id };
		if (!containsLink(node)) {
			node.children = [
				{
					type: "element",
					tagName: "a",
					properties: { href: `#${id}`, className: ["heading-link"] },
					children: node.children ?? [],
				},
			];
		}
		toc.push({ id, text, depth });
	});

	file.data.fm = { ...file.data.fm, toc };
};
