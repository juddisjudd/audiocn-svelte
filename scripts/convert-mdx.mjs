#!/usr/bin/env node
/**
 * Converts audiocn docs pages (Fumadocs .mdx) into stubs for this site (mdsvex .md).
 *
 *   node scripts/convert-mdx.mjs <audiocn content/docs dir | file.mdx ...> [options]
 *
 * Options:
 *   --out <dir>   Where pages go. Default: src/content/docs
 *   --force       Overwrite pages that already exist
 *   --dry-run     Print what would be written, write nothing
 *   --stdout      Print converted pages instead of writing them
 *
 * Given a directory, it converts every page under components/, hooks/ and
 * blocks/ except the section index pages, keeping the folder structure.
 *
 * What it does:
 * - keeps the frontmatter, rewording React and shadcn/ui in the SEO fields;
 * - adds a <script> that imports the docs components the page uses;
 * - keeps <ComponentPreview>, <PropsTable>, <Callout>, <Steps> and the other
 *   docs components, maps <ComponentSource> paths to this repo's files, and
 *   adds blank lines inside <Callout> so its content is parsed as markdown;
 * - turns `npx shadcn@latest add @audiocn/x` into the shadcn-svelte command
 *   (`@audiocn-svelte/x` expands to the registry URL from src/lib/docs/site.ts);
 * - turns tsx code blocks into svelte blocks and rewrites `@/` imports to
 *   `#lib/` paths, but leaves the React code itself to be ported by hand;
 * - escapes braces in prose, which Svelte would read as expressions.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SECTIONS = ["components", "hooks", "blocks"];

const DOCS_COMPONENTS = [
	"Callout",
	"ComponentPreview",
	"ComponentSource",
	"InstallCommand",
	"PropsTable",
	"Step",
	"Steps",
	"Tab",
	"Tabs",
	"TypeTable",
];

// Markup in a code sample, as opposed to a TypeScript generic such as `useRef<T>()`.
const JSX = /(^|[\s(>={])<[A-Za-z]/m;

const STUB_NOTE =
	"<!-- Converted from audiocn by scripts/convert-mdx.mjs. Port the code samples to Svelte and check the wording. -->";

const parseArgs = (argv) => {
	const options = {
		inputs: [],
		out: "src/content/docs",
		force: false,
		dryRun: false,
		stdout: false,
	};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--out") {
			options.out = argv[++index];
		} else if (arg === "--force") {
			options.force = true;
		} else if (arg === "--dry-run") {
			options.dryRun = true;
		} else if (arg === "--stdout") {
			options.stdout = true;
		} else if (arg === "--help" || arg === "-h") {
			options.help = true;
		} else {
			options.inputs.push(arg);
		}
	}
	return options;
};

// Imports in code samples: audiocn's `@/` alias to this repo's `#lib/` paths.
const rewriteImports = (code) =>
	code
		.replace(/(["'])@\/components\/ui\/([\w-]+)\1/g, "$1#lib/components/ui/$2/index.js$1")
		.replace(
			/(["'])@\/components\/blocks\/([\w-]+)\/[\w-]+\1/g,
			"$1#lib/components/blocks/$2/index.js$1"
		)
		.replace(/(["'])@\/hooks\/([\w-]+)\1/g, "$1#lib/hooks/$2.svelte.js$1")
		.replace(/(["'])@\/lib\/([\w/-]+)\1/g, "$1#lib/$2.js$1")
		.replace(/\bclassName=/g, "class=");

// Source files shown with <ComponentSource>: React paths to this repo's paths.
export const mapSourcePath = (file) => {
	let match = file.match(/^components\/ui\/([\w-]+)\.tsx$/);
	if (match) {
		return `src/lib/components/ui/${match[1]}/${match[1]}.svelte`;
	}
	match = file.match(/^components\/blocks\/([\w-]+)\/([\w-]+)\.tsx$/);
	if (match) {
		return `src/lib/components/blocks/${match[1]}/${match[2]}.svelte`;
	}
	match = file.match(/^hooks\/([\w-]+)\.ts$/);
	if (match) {
		return `src/lib/hooks/${match[1]}.svelte.ts`;
	}
	match = file.match(/^lib\/(.+)\.ts$/);
	if (match) {
		return `src/lib/${match[1]}.ts`;
	}
	if (file === "app/globals.css") {
		return "src/routes/layout.css";
	}
	return file;
};

const rewordForSvelte = (text) =>
	text.replace(/\bReact\b/g, "Svelte").replace(/shadcn\/ui/g, "shadcn-svelte");

const convertInstall = (line) =>
	line
		.replace(/npx shadcn@[\w.-]+/g, "npx shadcn-svelte@latest")
		.replace(/@audiocn\/([\w-]+)/g, "@audiocn-svelte/$1");

// Escapes braces outside inline code spans, so Svelte keeps them as text.
const escapeProse = (line) =>
	line
		.split(/(`+[^`]*`+)/)
		.map((part, index) =>
			index % 2 === 1 ? part : part.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;")
		)
		.join("");

const splitFrontmatter = (source) => {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	return match
		? { frontmatter: match[1], body: source.slice(match[0].length) }
		: { frontmatter: "", body: source };
};

const convertFrontmatter = (frontmatter) =>
	frontmatter
		.split(/\r?\n/)
		.map((line) => (/^seo(Title|Description):/.test(line) ? rewordForSvelte(line) : line))
		.join("\n");

const braceDepth = (text) => {
	let depth = 0;
	let quote = null;
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		if (quote) {
			if (char === "\\") {
				index += 1;
			} else if (char === quote) {
				quote = null;
			}
		} else if (char === '"' || char === "'" || char === "`") {
			quote = char;
		} else if (char === "{") {
			depth += 1;
		} else if (char === "}") {
			depth -= 1;
		}
	}
	return depth;
};

const convertTagLine = (line) =>
	line
		.replace(/\bclassName=/g, "class=")
		.replace(
			/(<ComponentSource\b[^>]*\bpath=)(["'])([^"']+)\2/,
			(_, start, quote, file) => `${start}${quote}${mapSourcePath(file)}${quote}`
		);

/** Converts one audiocn .mdx page to this site's .md format. */
export const convertMdx = (source) => {
	const { frontmatter, body } = splitFrontmatter(source.replace(/\r\n/g, "\n"));
	const lines = body.split("\n");
	const output = [];

	let fence = null; // { marker, lang }
	let tagDepth = 0; // inside a multi-line component tag
	let inTag = false;

	for (const line of lines) {
		if (fence) {
			if (line.trim() === fence.marker) {
				if (fence.open !== undefined) {
					const code = output.slice(fence.open + 1).join("\n");
					const lang = JSX.test(code) ? "svelte" : "ts";
					output[fence.open] = output[fence.open].replace(fence.marker, `${fence.marker}${lang}`);
				}
				fence = null;
				output.push(line);
			} else if (fence.lang === "npm") {
				output.push(convertInstall(line));
			} else {
				output.push(rewriteImports(line));
			}
			continue;
		}

		const opening = line.match(/^(\s*)(`{3,}|~{3,})([\w-]*)(.*)$/);
		if (opening) {
			const [, indent, marker, lang, rest] = opening;
			const meta = rest.replace(/title="app\/globals\.css"/, 'title="src/routes/layout.css"');
			const isReact = lang === "tsx" || lang === "jsx";
			// A React block becomes svelte or ts at its closing fence, once we know whether it has markup.
			fence = { marker, lang, open: isReact ? output.length : undefined };
			output.push(`${indent}${marker}${isReact ? "" : lang}${meta}`);
			continue;
		}

		if (inTag) {
			output.push(convertTagLine(line));
			tagDepth += braceDepth(line);
			if (tagDepth <= 0 && /\/?>\s*$/.test(line)) {
				inTag = false;
			}
			continue;
		}

		const comment = line.match(/^(\s*)\{\/\*([\s\S]*?)\*\/\}\s*$/);
		if (comment) {
			output.push(`${comment[1]}<!--${comment[2]}-->`);
			continue;
		}

		const tag = line.match(/^\s*<\/?([A-Z][\w.]*)/);
		if (tag) {
			const converted = convertTagLine(line);
			const depth = braceDepth(line);
			const closed = depth <= 0 && /\/?>\s*$/.test(line);
			if (/^\s*<Callout\b/.test(line) && closed) {
				output.push(converted, "");
			} else if (/^\s*<\/Callout>/.test(line)) {
				output.push("", converted);
			} else {
				output.push(converted);
			}
			if (!closed) {
				inTag = true;
				tagDepth = depth;
			}
			continue;
		}

		output.push(escapeProse(line));
	}

	const text = output
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
	const used = DOCS_COMPONENTS.filter((name) => new RegExp(`<${name}\\b`).test(text));
	const script = used.length
		? `<script>\n\timport { ${used.join(", ")} } from "#lib/docs/components/index.js";\n</script>\n\n`
		: "";

	return `---\n${convertFrontmatter(frontmatter)}\n---\n\n${script}${STUB_NOTE}\n\n${text}\n`;
};

const collectPages = async (input) => {
	const info = await stat(input);
	if (info.isFile()) {
		return [{ file: input, relative: path.basename(input) }];
	}
	const pages = [];
	for (const section of SECTIONS) {
		const dir = path.join(input, section);
		if (!existsSync(dir)) {
			continue;
		}
		for (const name of (await readdir(dir)).sort()) {
			if (name.endsWith(".mdx") && name !== "index.mdx") {
				pages.push({ file: path.join(dir, name), relative: path.join(section, name) });
			}
		}
	}
	return pages;
};

const main = async () => {
	const options = parseArgs(process.argv.slice(2));
	if (options.help || options.inputs.length === 0) {
		console.log(
			"Usage: node scripts/convert-mdx.mjs <audiocn content/docs dir | file.mdx ...> [--out dir] [--force] [--dry-run] [--stdout]"
		);
		process.exit(options.help ? 0 : 1);
	}

	let written = 0;
	let skipped = 0;
	for (const input of options.inputs) {
		for (const page of await collectPages(input)) {
			const converted = convertMdx(await readFile(page.file, "utf8"));
			const target = path.join(options.out, page.relative.replace(/\.mdx$/, ".md"));
			if (options.stdout) {
				console.log(`<!-- ${target} -->\n${converted}`);
				continue;
			}
			if (existsSync(target) && !options.force) {
				console.log(`skip   ${target} (exists; use --force)`);
				skipped += 1;
				continue;
			}
			if (!options.dryRun) {
				await mkdir(path.dirname(target), { recursive: true });
				await writeFile(target, converted);
			}
			console.log(`${options.dryRun ? "would write" : "write"}  ${target}`);
			written += 1;
		}
	}
	if (!options.stdout) {
		console.log(`${written} written, ${skipped} skipped`);
	}
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await main();
}
