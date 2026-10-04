import { getDocsEntries } from "#lib/server/content.js";

export const load = () => ({
	componentCount: getDocsEntries().filter((entry) => entry.slug.startsWith("components/")).length,
});
