import { getAllLlmsDocuments, getDocsEntries, loadMetaByDirectory } from '#lib/server/content.js';
import { buildDocsPageMap, type PageMapNode } from '#lib/core/page-map.js';
import { installCommand, REGISTRY_URL, siteConfig } from '#lib/docs/site.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#lib/site.js';
import type { RequestHandler } from './$types';

export const prerender = true;

/** Every real page under this node, flattened — category grouping only
 *  needs one level deep for an AI-consumed index, not nested markdown lists. */
function collectPages(nodes: PageMapNode[], out: PageMapNode[] = []): PageMapNode[] {
	for (const node of nodes) {
		if (node.kind === 'page') {
			if (node.isDocument) {
				out.push(node);
			}
			collectPages(node.children, out);
		}
	}
	return out;
}

function buildIndex(): string {
	const pageMap = buildDocsPageMap(getDocsEntries(), loadMetaByDirectory());
	const descriptionBySlug = new Map(
		getAllLlmsDocuments().map((doc) => [doc.slug, doc.description])
	);

	const lines: string[] = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		`${SITE_NAME} is a Svelte 5 port of ${siteConfig.upstream.name} (${siteConfig.upstream.url}), ${siteConfig.upstream.license} licensed.`,
		'',
		`Install components with the shadcn-svelte CLI from the registry at ${REGISTRY_URL}, for example: \`${installCommand('level-meter')}\`.`,
		''
	];

	let currentSection: PageMapNode[] = [];
	let sectionTitle = 'Docs';

	function flushSection() {
		if (currentSection.length === 0) {
			return;
		}
		lines.push(`## ${sectionTitle}`);
		for (const page of currentSection) {
			if (page.kind !== 'page') continue;
			const description = descriptionBySlug.get(page.slug);
			const suffix = description ? `: ${description}` : '';
			lines.push(`- [${page.title}](${SITE_URL}${page.path}.md)${suffix}`);
		}
		lines.push('');
		currentSection = [];
	}

	for (const node of pageMap) {
		if (node.kind === 'separator') {
			flushSection();
			sectionTitle = node.title;
			continue;
		}

		// A top-level folder is a section of its own, like a separator.
		if (node.children.length > 0) {
			flushSection();
			sectionTitle = node.title;
			currentSection.push(...collectPages([node]));
			flushSection();
			continue;
		}

		currentSection.push(...collectPages([node]));
	}
	flushSection();

	return lines.join('\n');
}

export const GET: RequestHandler = async () => {
	return new Response(buildIndex(), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
};
