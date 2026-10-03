import { error } from "@sveltejs/kit";
import { docsPages, getDocMetadata } from "#lib/docs/server/pages.js";
import { highlightExamples, highlightFiles } from "#lib/docs/server/source.js";

export const entries = () => [...docsPages.keys()].map((slug) => ({ slug }));

export const load = async ({ params }) => {
	const metadata = getDocMetadata(params.slug);
	if (!metadata) {
		error(404, "Page not found");
	}
	const [previewCode, sourceCode] = await Promise.all([
		highlightExamples(metadata.previewNames),
		highlightFiles(metadata.sourcePaths),
	]);
	return { previewCode, sourceCode };
};
