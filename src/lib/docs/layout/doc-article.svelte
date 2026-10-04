<script lang="ts">
	import type { Component } from "svelte";
	import { formatLastUpdated, type ContentSummary } from "#lib/core/content.js";
	import PageIcon from "#lib/icons/PageIcon.svelte";
	import { getEditUrl } from "#lib/site.js";
	import PageActions from "#lib/themes/docs/PageActions.svelte";
	import { setDocsPageContext } from "../context.js";
	import { siteConfig } from "../site.js";

	interface Props {
		data: {
			entry: ContentSummary;
			Content: Component | null;
			previews: Record<string, Component | undefined>;
			previewCode: Record<string, string | null>;
			sourceCode: Record<string, string | null>;
			seo: { seoTitle?: string; seoDescription?: string };
		};
		/** The page's own URL path, such as `/docs` for the docs home. */
		path: string;
	}

	let { data, path }: Props = $props();

	setDocsPageContext(() => ({
		previews: data.previews,
		previewCode: data.previewCode,
		sourceCode: data.sourceCode,
	}));

	const entry = $derived(data.entry);
	const Content = $derived(data.Content);
	const isItemPage = $derived(/^(components|blocks)\/./.test(entry.slug));
	const title = $derived(
		data.seo.seoTitle ?? (isItemPage ? `${entry.title} for Svelte` : entry.title)
	);
	const description = $derived(data.seo.seoDescription ?? entry.description);
</script>

<svelte:head>
	<title>{title} — {siteConfig.name}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta property="og:url" content="{siteConfig.url}{path}" />
	<link rel="canonical" href="{siteConfig.url}{path}" />
</svelte:head>

<article data-pagefind-body>
	<header>
		<h1><PageIcon name={entry.icon} class="title-icon" />{entry.title}</h1>
		{#if entry.description}
			<p class="lead">{entry.description}</p>
		{/if}
		<div data-pagefind-ignore>
			<p class="meta">{entry.readingTimeMinutes} min read · {entry.wordCount} words</p>
			<PageActions slug={entry.slug} editHref={getEditUrl(entry.sourcePath)} />
		</div>
	</header>

	{#if Content}
		<Content />
	{:else}
		<p>Unable to render this document component.</p>
	{/if}

	{#if entry.lastModified}
		<footer class="doc-colophon">
			Last updated on {formatLastUpdated(entry.lastModified)}
		</footer>
	{/if}
</article>

<style>
	header {
		margin-bottom: 1.75rem;
	}

	h1 {
		margin: 0;
		display: flex;
		align-items: center;
		font-size: clamp(1.9rem, 3.4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.15;
	}

	h1 :global(.title-icon) {
		flex-shrink: 0;
		width: 0.85em;
		height: 0.85em;
		margin-right: 0.4rem;
		color: var(--brand-strong);
	}

	header p {
		margin: 0.6rem 0 0;
	}

	.lead {
		color: var(--text-soft);
		font-size: 1.05rem;
		text-wrap: balance;
	}

	.meta {
		font-size: 0.82rem;
		color: var(--text-dim);
	}

	.doc-colophon {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
		font-size: 0.8rem;
		color: var(--text-dim);
		text-align: right;
	}
</style>
