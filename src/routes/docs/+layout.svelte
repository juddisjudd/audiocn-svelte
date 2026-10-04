<script lang="ts">
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { asset, resolve } from '$app/paths';
	import { getBreadcrumbsByPath, type PageMapNode } from '#lib/core/page-map.js';
	import { DOCS_PAGE_MAP_CONTEXT } from '#lib/core/page-map-context.js';
	import SidebarTree from '#lib/themes/docs/SidebarTree.svelte';
	import Toc from '#lib/themes/docs/Toc.svelte';
	import SearchDialog from '#lib/themes/docs/search/SearchDialog.svelte';
	import { enhanceCodeBlocks } from '#lib/themes/docs/code-blocks.js';
	import { renderMermaidBlocks } from '#lib/themes/docs/mermaid.js';
	import { observeHeadings } from '#lib/themes/docs/scroll-spy.js';
	import { readStorage } from '#lib/core/storage.js';
	import DocsFooter from '#lib/docs/layout/docs-footer.svelte';
	import DocsHeader from '#lib/docs/layout/docs-header.svelte';
	import ThemePicker from '#lib/docs/layout/theme-picker.svelte';
	import { withoutBase } from '#lib/docs/paths.js';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let sidebarOpen = $state(false);
	let navCollapsed = $state(readStorage('docs-nav') === 'collapsed');
	let proseEl: HTMLDivElement | undefined = $state();
	let activeHeadingId: string | undefined = $state();
	let searchDialog: ReturnType<typeof SearchDialog> | undefined = $state();

	function onWindowKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			searchDialog?.open();
		}
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	function toggleNav() {
		navCollapsed = !navCollapsed;
		try {
			localStorage.setItem('docs-nav', navCollapsed ? 'collapsed' : 'open');
		} catch {
			// storage unavailable — collapse still applies for this page view
		}
	}

	// A getter, not the array itself: reading `data.pageMap` here (component
	// init, outside any reactive context) would only capture its initial
	// value. Consumers call this inside their own `$derived` instead.
	setContext(DOCS_PAGE_MAP_CONTEXT, () => data.pageMap);

	// Without the base path, to match the page map's /docs/… paths under BASE_PATH.
	const currentPath = $derived(withoutBase(page.url.pathname).replace(/\/$/, '') || '/docs');
	const breadcrumbs = $derived(getBreadcrumbsByPath(currentPath, data.pageMap));

	type TocItem = { id: string; text: string; depth: number };
	const toc = $derived((page.data.toc ?? []) as TocItem[]);

	// Re-scan for un-enhanced code blocks and re-attach the TOC scroll-spy
	// whenever navigation swaps in a new doc page's static markup.
	$effect(() => {
		void currentPath;
		enhanceCodeBlocks(proseEl ?? null);
		renderMermaidBlocks(proseEl ?? null);
		return observeHeadings(
			proseEl ?? null,
			toc.map((item) => item.id),
			(id) => (activeHeadingId = id ?? undefined)
		);
	});

	type PagerLink = { title: string; path: string; slug: string };

	function flattenDocs(nodes: PageMapNode[]): PagerLink[] {
		const out: PagerLink[] = [];
		const walk = (list: PageMapNode[]) => {
			for (const node of list) {
				if (node.kind !== 'page') {
					continue;
				}
				if (node.isDocument) {
					out.push({ title: node.title, path: node.path, slug: node.slug });
				}
				walk(node.children);
			}
		};
		walk(nodes);
		return out;
	}

	const flatDocs = $derived(flattenDocs(data.pageMap));
	const documentPaths = $derived(new Set(flatDocs.map((node) => node.path)));
	// /docs renders the introduction document, so highlight and page through as that entry
	const pagerPath = $derived(currentPath === '/docs' ? '/docs/introduction' : currentPath);
	const pagerIndex = $derived(flatDocs.findIndex((node) => node.path === pagerPath));
	const prevDoc = $derived(pagerIndex > 0 ? flatDocs[pagerIndex - 1] : null);
	const nextDoc = $derived(
		pagerIndex >= 0 && pagerIndex < flatDocs.length - 1 ? flatDocs[pagerIndex + 1] : null
	);
</script>

<svelte:window onkeydown={onWindowKeydown} />

<svelte:head>
	<link
		rel="preload"
		href={asset('fonts/satoshi-400.woff2')}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<div class="svocs">
	<a class="skip" href="#main-content">Skip to content</a>

	<DocsHeader onSearch={() => searchDialog?.open()} />

	<SearchDialog bind:this={searchDialog} />

	<main id="main-content" class="docs-layout" class:nav-collapsed={navCollapsed}>
		<button
			class="mobile-toggle"
			type="button"
			aria-expanded={sidebarOpen}
			onclick={() => (sidebarOpen = !sidebarOpen)}
		>
			{sidebarOpen ? 'Close menu' : 'Menu'}
		</button>

		<aside class:open={sidebarOpen}>
			<div class="mobile-theme">
				<ThemePicker />
			</div>
			<nav aria-label="Documentation navigation">
				<SidebarTree nodes={data.pageMap} currentPath={pagerPath} onNavigate={closeSidebar} />
			</nav>
			<button
				class="rail-toggle"
				type="button"
				aria-expanded={!navCollapsed}
				aria-label={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				onclick={toggleNav}
			>
				<svg viewBox="0 0 16 16" aria-hidden="true" class:flipped={navCollapsed}>
					<path
						d="m9 4-4 4 4 4"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="m13 4-4 4 4 4"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</aside>

		<div class="doc-col">
			{#if breadcrumbs.length > 0}
				<nav class="breadcrumbs" aria-label="Breadcrumb">
					<ol>
						{#each breadcrumbs as crumb (crumb.path)}
							<li>
								<!-- A folder without an index page has no route to link to. -->
								{#if crumb.path === '/docs' || documentPaths.has(crumb.path)}
									<a
										href={crumb.path === '/docs'
											? resolve('/docs')
											: resolve('/docs/[...slug]', { slug: crumb.path.replace('/docs/', '') })}
										aria-current={crumb.path === currentPath ? 'page' : undefined}
									>
										{crumb.title}
									</a>
								{:else}
									<span>{crumb.title}</span>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}

			<div class="prose" bind:this={proseEl}>
				{@render children()}
			</div>

			{#if prevDoc || nextDoc}
				<nav class="pager" aria-label="Pagination">
					{#if prevDoc}
						<a class="prev" href={resolve('/docs/[...slug]', { slug: prevDoc.slug })}>
							<span aria-hidden="true">←</span>
							{prevDoc.title}
						</a>
					{:else}
						<span></span>
					{/if}
					{#if nextDoc}
						<a class="next" href={resolve('/docs/[...slug]', { slug: nextDoc.slug })}>
							{nextDoc.title}
							<span aria-hidden="true">→</span>
						</a>
					{/if}
				</nav>
			{/if}
		</div>

		<nav class="toc-rail" aria-label="Table of contents">
			{#if toc.length > 0}
				<Toc items={toc} activeId={activeHeadingId} />
			{/if}
		</nav>
	</main>

	<DocsFooter />

	<!-- Filter behind the theme-switch dissolve; see the ::view-transition rules in the styles. -->
	<svg class="dissolve-defs" width="0" height="0" aria-hidden="true" focusable="false">
		<filter
			id="svocs-dissolve"
			x="-15%"
			y="-15%"
			width="130%"
			height="130%"
			color-interpolation-filters="sRGB"
		>
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.012"
				numOctaves="4"
				seed="7"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				xChannelSelector="R"
				yChannelSelector="G"
				scale="0"
				result="displaced"
			>
				<animate attributeName="scale" values="0;90" dur="0.9s" begin="indefinite" fill="freeze" />
			</feDisplacementMap>
			<feColorMatrix
				in="noise"
				type="matrix"
				values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
				result="alpha-noise"
			/>
			<feComponentTransfer in="alpha-noise" result="threshold">
				<feFuncA type="linear" slope="16" intercept="1">
					<animate
						attributeName="intercept"
						values="1;-16"
						dur="0.9s"
						begin="indefinite"
						fill="freeze"
					/>
				</feFuncA>
			</feComponentTransfer>
			<feComposite in="displaced" in2="threshold" operator="in" />
		</filter>
	</svg>
</div>

<style>
	/*
	 * svocs theme tokens, mapped onto the site's shadcn tokens so the docs
	 * match the home page in both modes and follow the colour picker.
	 * --brand and --text-muted are svocs' --accent and --muted, renamed so
	 * they never shadow the shadcn tokens of the same names.
	 */
	.svocs {
		color-scheme: light;
		--bg: var(--background);
		--bg-elev: var(--card);
		--bg-soft: var(--muted);
		--bg-soft-2: color-mix(in oklch, var(--muted), var(--foreground) 6%);
		--text: var(--foreground);
		--text-soft: color-mix(in oklch, var(--foreground) 82%, var(--background));
		--text-dim: var(--muted-foreground);
		--text-muted: var(--muted-foreground);
		--line: var(--border);
		--line-strong: color-mix(in oklch, var(--border), var(--foreground) 10%);
		--brand: var(--primary);
		--brand-soft: color-mix(in oklch, var(--brand) 91%, black);
		--brand-strong: color-mix(in oklch, var(--brand) 76%, black);
		--brand-contrast: var(--primary-foreground);
		--danger: var(--destructive);
		--code-comment: #97867c;
		--code-keyword: #c2410c;
		--code-string: #8a6d2f;
		--code-function: #a05e14;
		--code-number: #ab4a30;
		--code-property: #33695f;
		--code-punctuation: #8d7f77;
		--code-operator: #6f6058;
		/* The home page has a plain background and a flat header. */
		--glow-a: transparent;
		--glow-b: transparent;
		--shadow-card:
			0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		--shadow-lift: 0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12);
		--shadow-bar: none;
	}

	:global(.dark) .svocs {
		color-scheme: dark;
		--brand-soft: color-mix(in oklch, var(--brand) 78%, white);
		--brand-strong: color-mix(in oklch, var(--brand) 60%, white);
		--code-comment: #857468;
		--code-keyword: #fb8c4b;
		--code-string: #c8b482;
		--code-function: #e0af68;
		--code-number: #e39a86;
		--code-property: #8fb8b2;
		--code-operator: #b3a49b;
		--shadow-card:
			0 1px 2px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.22),
			inset 0 1px 0 rgba(255, 255, 255, 0.035);
		--shadow-lift: 0 1px 2px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.38);
	}

	/* Theme-switch dissolve: the #svocs-dissolve filter disintegrates the old
	   page snapshot (ThemeToggle restarts its SMIL animations). This keyframe
	   holds the view transition open for the filter's duration — a transition
	   ends when its pseudo-element animations end — and degrades to a plain
	   fade if SMIL never fires. */
	@keyframes -global-svocs-burn-away {
		0%,
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	:global(::view-transition-old(root)) {
		/* Old snapshot must sit on top of (and dissolve to reveal) the new one. */
		z-index: 1;
		mix-blend-mode: normal;
		animation: svocs-burn-away 0.9s ease-in both;
		filter: url(#svocs-dissolve);
	}

	:global(::view-transition-new(root)) {
		mix-blend-mode: normal;
		animation: none;
	}

	.dissolve-defs {
		position: absolute;
		width: 0;
		height: 0;
	}

	.svocs {
		min-height: 100svh;
		display: grid;
		grid-template-rows: auto 1fr auto;
		font-family:
			'Satoshi', 'Aptos', 'Segoe UI Variable Text', 'Segoe UI', 'Trebuchet MS', sans-serif;
		background:
			radial-gradient(1200px 550px at 8% -12%, var(--glow-a) 0%, transparent 58%),
			radial-gradient(1000px 620px at 95% -10%, var(--glow-b) 0%, transparent 60%), var(--bg);
		color: var(--text);
		line-height: 1.55;
	}

	.svocs :global(a:focus-visible),
	.svocs :global(button:focus-visible),
	.svocs :global(input:focus-visible) {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}

	.svocs :global(::selection) {
		background: color-mix(in srgb, var(--brand) 32%, transparent);
	}

	.skip {
		position: absolute;
		left: -9999px;
	}

	.skip:focus {
		left: 1rem;
		top: 1rem;
		z-index: 50;
		background: var(--brand);
		color: var(--brand-contrast);
		padding: 0.4rem 0.6rem;
		border-radius: 0.4rem;
	}

	.docs-layout {
		display: grid;
		grid-template-columns: 17.5rem minmax(0, 1fr) 15.5rem;
		padding: 0 1rem;
		transition: grid-template-columns 220ms cubic-bezier(0.23, 1, 0.32, 1);
	}

	.docs-layout.nav-collapsed {
		grid-template-columns: 2.6rem minmax(0, 1fr) 15.5rem;
	}

	.mobile-toggle,
	.mobile-theme {
		display: none;
	}

	/* ---- sidebar ---- */

	aside {
		position: sticky;
		top: 3.6rem;
		height: calc(100vh - 3.6rem);
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--line);
		overflow: hidden;
	}

	aside nav {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		/* wheel/trackpad momentum at the nav's edge stays in the nav instead
		   of spilling into the page scroll */
		overscroll-behavior: contain;
		padding: 1.5rem 0.75rem 1rem 0;
	}

	/* Minimal auto-hiding scrollbars for the two rails: invisible until the
	   pointer is over (or focus is inside) the rail. */
	aside nav,
	.toc-rail {
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}

	aside nav:hover,
	aside nav:focus-within,
	.toc-rail:hover,
	.toc-rail:focus-within {
		scrollbar-color: color-mix(in srgb, var(--line-strong) 85%, transparent) transparent;
	}

	aside nav::-webkit-scrollbar,
	.toc-rail::-webkit-scrollbar {
		width: 6px;
	}

	aside nav::-webkit-scrollbar-thumb,
	.toc-rail::-webkit-scrollbar-thumb {
		background: transparent;
		border-radius: 3px;
	}

	aside nav:hover::-webkit-scrollbar-thumb,
	.toc-rail:hover::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--line-strong) 85%, transparent);
	}

	.nav-collapsed aside nav {
		display: none;
	}

	.rail-toggle {
		/* margin-top: auto keeps the button pinned bottom-left even when the
		   nav above it is hidden in the collapsed state */
		margin-top: auto;
		align-self: flex-start;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		margin-bottom: 1rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 0.45rem;
		background: transparent;
		color: var(--text-dim);
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.rail-toggle:hover {
		color: var(--brand-soft);
	}

	.rail-toggle svg {
		width: 0.95rem;
		height: 0.95rem;
		transition: transform 200ms ease;
	}

	.rail-toggle svg.flipped {
		transform: rotate(180deg);
	}

	/* ---- content column ---- */

	.doc-col {
		min-width: 0;
		max-width: 50rem;
		width: 100%;
		margin: 0 auto;
		padding: 1.75rem 3rem 4rem;
	}

	.breadcrumbs {
		margin-bottom: 1.25rem;
	}

	.breadcrumbs ol {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		font-size: 0.83rem;
	}

	.breadcrumbs li {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.breadcrumbs li:not(:last-child)::after {
		content: '/';
		color: var(--line-strong);
	}

	.breadcrumbs a,
	.breadcrumbs span {
		text-decoration: none;
		color: var(--text-dim);
		transition: color 120ms ease;
	}

	.breadcrumbs a:hover {
		color: var(--text);
	}

	.breadcrumbs a[aria-current='page'] {
		color: var(--text);
		font-weight: 600;
	}

	/*
	 * ---- shared prose styles for doc pages ----
	 * svocs leans on browser defaults for headings, paragraphs and lists;
	 * Tailwind's preflight resets those, so they are restated here. Elements
	 * inside .not-prose (live previews, props tables) keep their own styles.
	 */

	.prose :global(:where(h2, h3, h4):not(:where(.not-prose, .not-prose *))) {
		scroll-margin-top: 5rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.3;
	}

	.prose :global(:where(h2):not(:where(.not-prose, .not-prose *))) {
		margin: 2.5rem 0 1rem;
		font-size: 1.5rem;
	}

	.prose :global(:where(h3):not(:where(.not-prose, .not-prose *))) {
		margin: 2rem 0 0.75rem;
		font-size: 1.17rem;
	}

	.prose :global(:where(h4):not(:where(.not-prose, .not-prose *))) {
		margin: 1.5rem 0 0.5rem;
		font-size: 1rem;
	}

	.prose :global(:where(p, ul, ol, table, blockquote):not(:where(.not-prose, .not-prose *))) {
		margin-block: 1rem;
	}

	.prose :global(:where(ul):not(:where(.not-prose, .not-prose *))) {
		list-style: disc;
		padding-left: 1.5rem;
	}

	.prose :global(:where(ol):not(:where(.not-prose, .not-prose *))) {
		list-style: decimal;
		padding-left: 1.5rem;
	}

	.prose :global(:where(li):not(:where(.not-prose, .not-prose *))) {
		margin-block: 0.3rem;
	}

	.prose :global(:where(li):not(:where(.not-prose, .not-prose *))::marker) {
		color: var(--text-dim);
	}

	.prose :global(:where(hr):not(:where(.not-prose, .not-prose *))) {
		margin-block: 2rem;
		border-top: 1px solid var(--line);
	}

	/* rehypeTables wraps each table, so wide ones scroll instead of widening the page. */
	.prose :global(.table-wrapper) {
		margin-block: 1rem;
		overflow-x: auto;
	}

	.prose :global(.table-wrapper table) {
		width: 100%;
		margin: 0;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.prose :global(:where(th, td):not(:where(.not-prose, .not-prose *))) {
		padding: 0.5rem 0.9rem;
		border-bottom: 1px solid var(--line);
		text-align: left;
		vertical-align: top;
	}

	.prose :global(:where(th):not(:where(.not-prose, .not-prose *))) {
		color: var(--text-dim);
		font-weight: 600;
		border-bottom-color: var(--line-strong);
	}

	.prose :global(:where(td):not(:where(.not-prose, .not-prose *))) {
		color: var(--text-soft);
	}

	.prose :global(:where(code):not(:where(.not-prose, .not-prose *))) {
		font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
		font-size: 0.9em;
	}

	.prose :global(:where(:not(pre) > code):not(:where(.not-prose, .not-prose *))) {
		padding: 0.12em 0.35em;
		border-radius: 0.3em;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		/* long names such as MediaStreamAudioDestinationNode wrap on phones */
		overflow-wrap: anywhere;
	}

	.prose :global(.heading-anchor) {
		margin-left: 0.35rem;
		text-decoration: none;
		opacity: 0;
		color: var(--brand-strong);
		transition: opacity 120ms ease;
	}

	.prose :global(h2:hover .heading-anchor),
	.prose :global(h3:hover .heading-anchor),
	.prose :global(.heading-anchor:focus-visible) {
		opacity: 1;
	}

	.prose :global(:where(p, li):not(:where(.not-prose, .not-prose *))) {
		color: var(--text-soft);
		line-height: 1.7;
	}

	.prose :global(:where(a):not(:where(.not-prose, .not-prose *))) {
		color: var(--brand-strong);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--brand-strong) 45%, transparent);
	}

	.prose :global(:where(a):not(:where(.not-prose, .not-prose *)):hover) {
		color: var(--brand-soft);
		text-decoration-color: currentColor;
	}

	/* code-frame markup comes from the build-time highlighter, code-copy
	   from enhanceCodeBlocks() — not this component, hence :global. */
	.prose :global(.code-frame) {
		margin: 1rem 0;
		border: 1px solid var(--line);
		border-radius: 0.65rem;
		overflow: hidden;
		background: var(--bg-soft);
	}

	.prose :global(.code-frame-header) {
		padding: 0.5rem 0.9rem;
		font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
		font-size: 0.78rem;
		color: var(--text-dim);
		border-bottom: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg-soft-2) 60%, transparent);
	}

	.prose :global(.code-frame-body) {
		position: relative;
	}

	.prose :global(.code-frame-body pre) {
		margin: 0;
		border: none;
		border-radius: 0;
		background: transparent;
		padding: 0.9rem 1rem;
		padding-right: 3rem;
		overflow: auto;
		color: var(--text-soft);
		font-size: 0.875rem;
		line-height: 1.6;
		tab-size: 2;
	}

	.prose :global(.code-frame-body :is(pre, code)) {
		font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
	}

	.prose :global(.code-frame-body code) {
		font-size: inherit;
	}

	/* Prism token colors — mdsvex tokenizes fences at build time but ships no
	   theme, so without these rules code renders monochrome. */
	.prose :global(.token.comment),
	.prose :global(.token.prolog),
	.prose :global(.token.doctype),
	.prose :global(.token.cdata) {
		color: var(--code-comment);
		font-style: italic;
	}

	.prose :global(.token.punctuation) {
		color: var(--code-punctuation);
	}

	.prose :global(.token.keyword),
	.prose :global(.token.tag),
	.prose :global(.token.selector),
	.prose :global(.token.important),
	.prose :global(.token.atrule) {
		color: var(--code-keyword);
	}

	.prose :global(.token.string),
	.prose :global(.token.char),
	.prose :global(.token.attr-value),
	.prose :global(.token.regex),
	.prose :global(.token.inserted) {
		color: var(--code-string);
	}

	.prose :global(.token.function),
	.prose :global(.token.class-name) {
		color: var(--code-function);
	}

	.prose :global(.token.number),
	.prose :global(.token.boolean),
	.prose :global(.token.constant),
	.prose :global(.token.symbol),
	.prose :global(.token.deleted) {
		color: var(--code-number);
	}

	.prose :global(.token.property),
	.prose :global(.token.attr-name),
	.prose :global(.token.builtin),
	.prose :global(.token.variable),
	.prose :global(.token.entity) {
		color: var(--code-property);
	}

	.prose :global(.token.operator),
	.prose :global(.token.url) {
		color: var(--code-operator);
	}

	.prose :global(.token.bold) {
		font-weight: 600;
	}

	.prose :global(.token.italic) {
		font-style: italic;
	}

	.prose :global(.code-copy) {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--bg-elev) 85%, transparent);
		color: var(--text-dim);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 120ms ease,
			color 120ms ease;
	}

	.prose :global(.code-copy svg) {
		width: 0.9rem;
		height: 0.9rem;
	}

	.prose :global(.code-copy.copied) {
		color: var(--brand-strong);
		border-color: color-mix(in srgb, var(--brand) 40%, var(--line));
	}

	.prose :global(.code-frame-body:hover .code-copy),
	.prose :global(.code-copy:focus-visible) {
		opacity: 1;
	}

	@media (hover: hover) and (pointer: fine) {
		.prose :global(.code-copy:hover) {
			color: var(--brand-soft);
		}
	}

	@media (hover: none) {
		.prose :global(.code-copy) {
			opacity: 1;
		}
	}

	.prose :global(:where(img):not(:where(.not-prose, .not-prose *))) {
		max-width: 100%;
		border: 1px solid var(--line);
		border-radius: 0.65rem;
	}

	/* Mermaid source shows briefly before the lazy client renderer swaps in
	   the SVG; style it small and dim until then. */
	.prose :global(pre.mermaid) {
		display: flex;
		justify-content: center;
		margin: 1rem 0;
		padding: 0.5rem 0;
		border: none;
		background: transparent;
		overflow-x: auto;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.prose :global(:where(blockquote):not(:where(.not-prose, .not-prose *))) {
		padding: 0.75rem 0.9rem;
		border-left: 3px solid var(--brand);
		border-radius: 0 0.45rem 0.45rem 0;
		background: color-mix(in srgb, var(--bg-soft) 86%, transparent);
		color: var(--text-soft);
	}

	/* ---- pager ---- */

	.pager {
		margin-top: 3.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.pager a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 48%;
		/* long camelCase titles such as useReducedMotion must wrap on phones */
		overflow-wrap: anywhere;
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		color: var(--text-soft);
		transition: color 120ms ease;
	}

	.pager a:hover {
		color: var(--brand-strong);
	}

	.pager .next {
		margin-left: auto;
		text-align: right;
	}

	.pager span[aria-hidden='true'] {
		color: var(--text-dim);
		transition: transform 140ms ease;
	}

	@media (hover: hover) and (pointer: fine) {
		.pager .next:hover span[aria-hidden='true'] {
			transform: translateX(3px);
		}

		.pager .prev:hover span[aria-hidden='true'] {
			transform: translateX(-3px);
		}
	}

	/* ---- toc rail ---- */

	.toc-rail {
		position: sticky;
		top: 3.6rem;
		height: calc(100vh - 3.6rem);
		overflow-y: auto;
		/* long TOC titles wrap (see Toc.svelte); never a horizontal bar */
		overflow-x: hidden;
		overscroll-behavior: contain;
		padding: 1.75rem 0 2.5rem 1.25rem;
		font-size: 0.8rem;
	}

	/* ---- responsive ---- */

	@media (max-width: 1100px) {
		.docs-layout {
			grid-template-columns: 17.5rem minmax(0, 1fr);
		}

		.docs-layout.nav-collapsed {
			grid-template-columns: 2.6rem minmax(0, 1fr);
		}

		.toc-rail {
			display: none;
		}
	}

	@media (max-width: 900px) {
		.docs-layout,
		.docs-layout.nav-collapsed {
			grid-template-columns: minmax(0, 1fr);
			padding-top: 0.85rem;
		}

		.mobile-toggle {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			justify-self: start;
			padding: 0.5rem 0.85rem;
			border: 1px solid var(--line);
			border-radius: 0.55rem;
			background: color-mix(in srgb, var(--bg-soft) 88%, transparent);
			color: var(--text);
			font-weight: 600;
		}

		aside {
			display: none;
			position: static;
			height: auto;
			border-right: none;
			border-bottom: 1px solid var(--line);
			overflow: visible;
		}

		aside.open {
			display: block;
		}

		.mobile-theme {
			display: block;
			padding-top: 0.85rem;
		}

		aside nav,
		.nav-collapsed aside nav {
			display: block;
			padding: 0.85rem 0 1.25rem;
			/* Full shorthand, not just overflow-y: pairing a "visible" y-axis
			   with the desktop rule's overflow-x: hidden makes the UA force
			   y back to auto, silently re-trapping mobile scroll inside this
			   nav instead of the page. */
			overflow: visible;
		}

		.rail-toggle {
			display: none;
		}

		.doc-col {
			max-width: none;
			padding: 1.5rem 0 3rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.docs-layout,
		.rail-toggle svg {
			transition-duration: 0.01ms;
		}
	}
</style>
