<script lang="ts">
	import { page } from "$app/state";
	import { setDocsPageContext } from "#lib/docs/context.js";
	import DocsPager from "#lib/docs/layout/docs-pager.svelte";
	import DocsToc from "#lib/docs/layout/docs-toc.svelte";
	import { navPages } from "#lib/docs/nav.js";
	import { withoutBase } from "#lib/docs/paths.js";
	import { siteConfig } from "#lib/docs/site.js";

	let { data } = $props();

	setDocsPageContext(() => ({
		previews: data.previews,
		previewCode: data.previewCode,
		sourceCode: data.sourceCode,
	}));

	const pages = $derived(navPages(data.nav));
	const pathname = $derived(withoutBase(page.url.pathname));
	const index = $derived(pages.findIndex((item) => item.href === pathname));
	const previous = $derived(index > 0 ? pages[index - 1] : undefined);
	const next = $derived(index >= 0 ? pages[index + 1] : undefined);

	const metadata = $derived(data.metadata);
	const Content = $derived(data.content);

	const isItemPage = $derived(/^\/docs\/(components|blocks)\/./.test(pathname));
	const title = $derived(
		metadata.seoTitle ?? (isItemPage ? `${metadata.title} for Svelte` : metadata.title)
	);
	const description = $derived(metadata.seoDescription ?? metadata.description);
</script>

<svelte:head>
	<title>{title} — {siteConfig.name}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:title" content={title} />
	<link rel="canonical" href="{siteConfig.url}{pathname}" />
</svelte:head>

<div class="flex w-full flex-1">
	<article class="mx-auto w-full max-w-3xl min-w-0 px-4 pt-8 pb-16 sm:px-8 lg:pt-12">
		<header class="mb-8 flex flex-col gap-2">
			<h1 class="text-3xl font-semibold tracking-tight text-balance">{metadata.title}</h1>
			{#if metadata.description}
				<p class="text-lg text-balance text-muted-foreground">{metadata.description}</p>
			{/if}
		</header>
		<div class="docs-prose">
			<Content />
		</div>
		<DocsPager {previous} {next} />
	</article>
	<aside class="hidden w-60 shrink-0 xl:block">
		<div class="sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto py-12 pe-6">
			<DocsToc toc={metadata.toc ?? []} />
		</div>
	</aside>
</div>
