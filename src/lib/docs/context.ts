import { getContext, setContext, type Component } from "svelte";

export interface DocsPageContext {
	/** Example components by name, loaded before the page renders. */
	previews: Record<string, Component | undefined>;
	/** Highlighted example source by name. */
	previewCode: Record<string, string | null>;
	/** Highlighted file source by path. */
	sourceCode: Record<string, string | null>;
}

const KEY = Symbol("docs-page");

/** Called by the docs page with the examples and sources its markdown uses. */
export const setDocsPageContext = (context: () => DocsPageContext) => setContext(KEY, context);

/** Returns a getter, so readers stay current when the page's data changes. */
export const useDocsPageContext = () =>
	getContext<(() => DocsPageContext) | undefined>(KEY) ?? (() => undefined);
