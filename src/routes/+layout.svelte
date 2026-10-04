<script lang="ts">
	import "./layout.css";
	import { onMount } from "svelte";
	import { ModeWatcher, toggleMode } from "mode-watcher";
	import { page } from "$app/state";
	import { Toaster } from "#lib/components/ui/sonner/index.js";
	import * as Tooltip from "#lib/components/ui/tooltip/index.js";
	import SiteFooter from "#lib/docs/layout/site-footer.svelte";
	import SiteHeader from "#lib/docs/layout/site-header.svelte";
	import { packageManager } from "#lib/docs/package-manager.svelte.js";
	import { withBase, withoutBase } from "#lib/docs/paths.js";
	import { siteConfig } from "#lib/docs/site.js";
	import { THEME_STORAGE_KEY } from "#lib/docs/site-themes.js";
	import { SITE_URL } from "#lib/site.js";

	let { children } = $props();

	onMount(() => {
		packageManager.sync();
	});

	const pathname = $derived(withoutBase(page.url.pathname));
	// The docs layout brings its own svocs header and footer. Its page map is
	// missing when its load failed, such as a 404, which then renders here.
	const docsShell = $derived("pageMap" in page.data);

	// scripts/og/generate.mjs renders build/og/<route>.png for every prerendered page.
	const ogPath = $derived(pathname.replace(/\/$/, "") || "/index");
	const ogImage = $derived(`${SITE_URL}/og${ogPath}.png`);

	const isTypingTarget = (target: EventTarget | null) =>
		target instanceof HTMLElement &&
		(target.isContentEditable ||
			target.tagName === "INPUT" ||
			target.tagName === "TEXTAREA" ||
			target.tagName === "SELECT");

	function onkeydown(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.repeat ||
			event.metaKey ||
			event.ctrlKey ||
			event.altKey ||
			event.key.toLowerCase() !== "d" ||
			isTypingTarget(event.target)
		) {
			return;
		}
		toggleMode();
	}
</script>

<svelte:window {onkeydown} />

<svelte:head>
	<link rel="icon" href={withBase("/favicon.ico")} sizes="32x32" />
	<link rel="icon" href={withBase("/favicon.svg")} type="image/svg+xml" />
	<link rel="apple-touch-icon" href={withBase("/apple-touch-icon.png")} />
	<link rel="manifest" href={withBase("/site.webmanifest")} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<ModeWatcher themeStorageKey={THEME_STORAGE_KEY} />

<Tooltip.Provider>
	{#if docsShell}
		{@render children()}
	{:else}
		<div class="flex min-h-svh flex-col">
			<SiteHeader />
			<div class="flex min-h-0 flex-1 flex-col">
				{@render children()}
			</div>
			<SiteFooter />
		</div>
	{/if}
</Tooltip.Provider>

<Toaster />
