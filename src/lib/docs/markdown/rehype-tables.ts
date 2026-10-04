interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

/** Wraps markdown tables in a box that scrolls sideways, so wide tables never widen the page. */
export const rehypeTables = () => (tree: HastNode) => {
	const visit = (node: HastNode) => {
		node.children = node.children?.map((child) => {
			visit(child);
			return child.type === "element" && child.tagName === "table"
				? {
						type: "element",
						tagName: "div",
						properties: { className: ["table-wrapper"] },
						children: [child],
					}
				: child;
		});
	};
	visit(tree);
};
