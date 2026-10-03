import { error } from "@sveltejs/kit";
import { slugFromPath } from "#lib/docs/nav.js";
import { loadExample } from "#lib/docs/examples.js";
import type { DocModule } from "#lib/docs/types.js";

const pages = import.meta.glob<DocModule>("/src/content/docs/**/*.md");

export const load = async ({ params, data }) => {
	const path = Object.keys(pages).find((key) => slugFromPath(key) === params.slug);
	if (!path) {
		error(404, "Page not found");
	}
	const page = await pages[path]();
	const names = page.metadata.previewNames ?? [];
	const previews = Object.fromEntries(
		await Promise.all(names.map(async (name) => [name, await loadExample(name)] as const))
	);
	return {
		...data,
		content: page.default,
		metadata: page.metadata,
		previews,
	};
};
