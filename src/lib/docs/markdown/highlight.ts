import { createHighlighter, type Highlighter } from "shiki";

export const CODE_THEMES = {
	light: "github-light",
	dark: "github-dark-high-contrast",
} as const;

const LANGUAGES = [
	"svelte",
	"typescript",
	"tsx",
	"javascript",
	"json",
	"css",
	"html",
	"bash",
	"diff",
	"markdown",
	"yaml",
];

let highlighter: Promise<Highlighter> | undefined;

const getHighlighter = () =>
	(highlighter ??= createHighlighter({
		themes: Object.values(CODE_THEMES),
		langs: LANGUAGES,
	}));

/** Highlights code with both themes as CSS variables; the site CSS picks one. */
export const highlightCode = async (code: string, lang?: string | null) => {
	const shiki = await getHighlighter();
	const requested = lang?.toLowerCase() ?? "text";
	const language = shiki.getLoadedLanguages().includes(requested) ? requested : "text";
	return shiki.codeToHtml(code.replace(/\n+$/, ""), {
		lang: language,
		themes: CODE_THEMES,
		defaultColor: false,
	});
};

/** Escapes HTML so it can sit inside `{@html `...`}` in a Svelte component. */
export const escapeSvelte = (html: string) =>
	html.replace(
		/[{}`\\]/g,
		(char) => ({ "{": "&#123;", "}": "&#125;", "`": "&#96;", "\\": "&#92;" })[char] ?? char
	);

const TITLE = /title=(?:"([^"]*)"|'([^']*)')/;

/** mdsvex highlighter: every fenced block becomes a `DocsCodeBlock` with a copy button. */
export const highlightCodeBlock = async (
	code: string,
	lang: string | null | undefined,
	meta: string | null | undefined
) => {
	const html = escapeSvelte(await highlightCode(code, lang));
	const match = meta?.match(TITLE);
	const title = match?.[1] ?? match?.[2];
	const attributes = [
		title ? `title={${JSON.stringify(title)}}` : "",
		lang ? `lang={${JSON.stringify(lang)}}` : "",
	]
		.filter(Boolean)
		.join(" ");
	return `<DocsCodeBlock ${attributes}>{@html \`${html}\`}</DocsCodeBlock>`;
};
