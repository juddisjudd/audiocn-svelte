import { docsPages } from "#lib/docs/server/pages.js";

export const load = () => ({
	componentCount: [...docsPages.values()].filter((page) =>
		page.href.startsWith("/docs/components/")
	).length,
});
