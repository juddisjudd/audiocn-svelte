import type { Component } from "svelte";

const components = import.meta.glob<{ default: Component }>("./examples/*.svelte");

const sources = import.meta.glob<string>("./examples/*.svelte", {
	query: "?raw",
	import: "default",
});

const keyFor = (name: string) => `./examples/${name}.svelte`;

/** The example names that exist, from `src/lib/docs/examples/<name>.svelte`. */
export const exampleNames = Object.keys(components).map((key) =>
	key.replace(/^\.\/examples\//, "").replace(/\.svelte$/, "")
);

export const loadExample = async (name: string) => (await components[keyFor(name)]?.())?.default;

/** Example components by name, loaded before a docs page renders. */
export const loadExamples = async (names: string[]) =>
	Object.fromEntries(
		await Promise.all(names.map(async (name) => [name, await loadExample(name)] as const))
	);

export const loadExampleSource = async (name: string) => {
	const source = await sources[keyFor(name)]?.();
	return source?.replace(/\n+$/, "");
};
