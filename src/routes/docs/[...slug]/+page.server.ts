import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDocEntryBySlug, getDocTocBySlug } from '#lib/server/content.js';
import { loadDocAssets } from '#lib/docs/server/source.js';

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const slugParts = params.slug.split('/');
	const entry = getDocEntryBySlug(slugParts);

	if (!entry) {
		error(404, `Document not found: ${slugParts.join('/')}`);
	}

	return {
		entry,
		toc: getDocTocBySlug(slugParts),
		...(await loadDocAssets(slugParts))
	};
};
