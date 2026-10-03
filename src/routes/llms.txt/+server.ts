import { orderedDocsPages } from "#lib/docs/server/pages.js";
import { installCommand, REGISTRY_URL, siteConfig } from "#lib/docs/site.js";

export const prerender = true;

export const GET = () => {
	const lines = orderedDocsPages.map(
		(page) => `- [${page.title}](${siteConfig.url}${page.href}): ${page.description}`
	);

	const body = [
		`# ${siteConfig.name}`,
		"",
		`> ${siteConfig.description}`,
		"",
		`${siteConfig.name} is a Svelte 5 port of ${siteConfig.upstream.name} (${siteConfig.upstream.url}), ${siteConfig.upstream.license} licensed.`,
		"",
		`Install components with the shadcn-svelte CLI from the registry at ${REGISTRY_URL}, for example: \`${installCommand("level-meter")}\`.`,
		"",
		"## Docs",
		"",
		...lines,
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
