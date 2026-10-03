interface MdNode {
	type: string;
	value?: string;
	lang?: string | null;
	children?: MdNode[];
}

interface MdFile {
	data: { fm?: Record<string, unknown> };
}

/** Components the docs markdown pipeline renders itself, imported into each page that needs them. */
const PIPELINE_IMPORTS = {
	DocsCodeBlock: "#lib/docs/components/code-block.svelte",
	DocsInstallCommand: "#lib/docs/components/install-command.svelte",
} as const;

type PipelineComponent = keyof typeof PIPELINE_IMPORTS;

const INSTANCE_SCRIPT = /^<script(?![^>]*\b(?:module|context\s*=))[^>]*>/;
const PREVIEW_NAME = /<ComponentPreview\b[^>]*?\bname=["']([^"']+)["']/g;
const SOURCE_PATH = /<ComponentSource\b[^>]*?\bpath=["']([^"']+)["']/g;

const walk = (node: MdNode, visit: (node: MdNode, parent: MdNode) => void) => {
	for (const child of node.children ?? []) {
		visit(child, node);
		walk(child, visit);
	}
};

const collect = (html: string, pattern: RegExp, into: Set<string>) => {
	for (const match of html.matchAll(pattern)) {
		into.add(match[1]);
	}
};

/**
 * The docs remark plugin:
 * - renders ```npm blocks as an install command with a package manager switcher,
 *   like audiocn's remark-install-command;
 * - records the examples and source files a page shows, so its load function
 *   can prepare them (`previewNames`, `sourcePaths` in the page metadata);
 * - imports the pipeline's own components into the page's script.
 */
export const remarkDocs = () => (tree: MdNode, file: MdFile) => {
	const used = new Set<PipelineComponent>();
	const previews = new Set<string>();
	const sources = new Set<string>();

	walk(tree, (node) => {
		if (node.type === "code") {
			if (node.lang === "npm") {
				node.type = "html";
				node.value = `<DocsInstallCommand command={${JSON.stringify(node.value?.trim() ?? "")}} />`;
				used.add("DocsInstallCommand");
			} else {
				used.add("DocsCodeBlock");
			}
		} else if (node.type === "html" && node.value) {
			collect(node.value, PREVIEW_NAME, previews);
			collect(node.value, SOURCE_PATH, sources);
		}
	});

	file.data.fm = {
		...file.data.fm,
		previewNames: [...previews],
		sourcePaths: [...sources],
	};

	if (used.size === 0) {
		return;
	}

	const imports = [...used]
		.map((name) => `\timport ${name} from "${PIPELINE_IMPORTS[name]}";`)
		.join("\n");
	const children = tree.children ?? [];
	const script = children.find(
		(child) => child.type === "html" && INSTANCE_SCRIPT.test(child.value ?? "")
	);

	if (script?.value) {
		script.value = script.value.replace(INSTANCE_SCRIPT, (tag) => `${tag}\n${imports}`);
	} else {
		const index = children[0]?.type === "yaml" ? 1 : 0;
		children.splice(index, 0, { type: "html", value: `<script>\n${imports}\n</script>` });
	}
};
