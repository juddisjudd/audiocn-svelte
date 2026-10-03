import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadExampleSource } from "../examples.js";
import { highlightCode } from "../markdown/highlight.js";

const LANGUAGES: Record<string, string> = {
	svelte: "svelte",
	ts: "typescript",
	js: "javascript",
	css: "css",
	json: "json",
	html: "html",
};

const languageFor = (file: string) => LANGUAGES[file.split(".").pop() ?? ""] ?? "text";

/** Reads a project file at build time. Pages are prerendered from the project root. */
const readSource = async (relativePath: string) => {
	try {
		return await readFile(path.join(process.cwd(), relativePath), "utf-8");
	} catch {
		return null;
	}
};

const entries = async <T>(keys: string[] | undefined, read: (key: string) => Promise<T>) => {
	const pairs = await Promise.all((keys ?? []).map(async (key) => [key, await read(key)] as const));
	return Object.fromEntries(pairs) as Record<string, T>;
};

/** Highlighted source for every example a page previews, by name. */
export const highlightExamples = (names: string[] | undefined) =>
	entries(names, async (name) => {
		const source = await loadExampleSource(name);
		return source === undefined ? null : await highlightCode(source, "svelte");
	});

/** Highlighted source for every file a page shows, by path. */
export const highlightFiles = (paths: string[] | undefined) =>
	entries(paths, async (file) => {
		const source = await readSource(file);
		return source === null ? null : await highlightCode(source, languageFor(file));
	});
