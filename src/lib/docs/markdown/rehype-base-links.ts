interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

/** Puts the deploy base path in front of root-relative links, such as `/docs/components/fader`. */
export const rehypeBaseLinks = (base: string) => () => (tree: HastNode) => {
	if (!base) {
		return;
	}
	const visit = (node: HastNode) => {
		const href = node.properties?.href;
		if (
			node.tagName === "a" &&
			typeof href === "string" &&
			href.startsWith("/") &&
			!href.startsWith("//")
		) {
			node.properties = { ...node.properties, href: `${base}${href}` };
		}
		node.children?.forEach(visit);
	};
	visit(tree);
};
