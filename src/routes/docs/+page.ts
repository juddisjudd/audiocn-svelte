import type { PageLoad } from './$types';
import { loadDocComponent } from '#lib/core/content.js';
import { loadExamples } from '#lib/docs/examples.js';

export const prerender = true;

export const load: PageLoad = async ({ data }) => {
	const [Content, previews] = await Promise.all([
		loadDocComponent(data.entry.slug),
		loadExamples(data.previewNames)
	]);
	return { ...data, Content, previews };
};
