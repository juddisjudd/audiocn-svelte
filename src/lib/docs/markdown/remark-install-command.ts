interface MdNode {
	type: string;
	value?: string;
	lang?: string | null;
	children?: MdNode[];
}

const COMPONENT = "DocsInstallCommand";
const IMPORT = `import ${COMPONENT} from "#lib/docs/components/install-command.svelte";`;
const INSTANCE_SCRIPT = /^<script(?![^>]*\b(?:module|context\s*=))[^>]*>/;

const walk = (node: MdNode, visit: (node: MdNode) => void) => {
	for (const child of node.children ?? []) {
		visit(child);
		walk(child, visit);
	}
};

/**
 * Renders ```npm fences as an install command with a package manager
 * switcher, like audiocn's remark-install-command. The fence stays plain
 * markdown, so llms.txt and the per-page `.md` exports show the command.
 */
export const remarkInstallCommand = () => (tree: MdNode) => {
	let used = false;
	walk(tree, (node) => {
		if (node.type === "code" && node.lang === "npm") {
			node.type = "html";
			node.value = `<${COMPONENT} command={${JSON.stringify(node.value?.trim() ?? "")}} />`;
			used = true;
		}
	});
	if (!used) {
		return;
	}

	const children = tree.children ?? [];
	const script = children.find(
		(child) => child.type === "html" && INSTANCE_SCRIPT.test(child.value ?? "")
	);
	if (script?.value) {
		script.value = script.value.replace(INSTANCE_SCRIPT, (tag) => `${tag}\n\t${IMPORT}`);
	} else {
		const index = children[0]?.type === "yaml" ? 1 : 0;
		children.splice(index, 0, { type: "html", value: `<script>\n\t${IMPORT}\n</script>` });
	}
};
