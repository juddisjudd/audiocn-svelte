// Same rules as github-slugger, which audiocn's docs use, so anchors match.
const REMOVE = /[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu;

export const slugify = (text: string) => text.toLowerCase().replace(REMOVE, "").replace(/ /g, "-");

/** Slugs headings in order, numbering duplicates like GitHub does. */
export class Slugger {
	#seen = new Map<string, number>();

	slug(text: string) {
		const base = slugify(text);
		let slug = base;
		let count = this.#seen.get(base) ?? 0;
		while (this.#seen.has(slug)) {
			count += 1;
			slug = `${base}-${count}`;
		}
		this.#seen.set(base, count);
		this.#seen.set(slug, 0);
		return slug;
	}
}

const ENTITIES: Record<string, string> = {
	"&#123;": "{",
	"&#125;": "}",
	"&#96;": "`",
	"&#92;": "\\",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
	"&amp;": "&",
};

/** Decodes the entities mdsvex writes into code and text nodes. */
export const decodeEntities = (text: string) =>
	text.replace(/&(?:#\d+|[a-z]+);/g, (entity) => ENTITIES[entity] ?? entity);
