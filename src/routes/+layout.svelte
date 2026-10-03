<script lang="ts">
	import "./layout.css";
	import { onMount } from "svelte";
	import { ModeWatcher, toggleMode } from "mode-watcher";
	import { Toaster } from "#lib/components/ui/sonner/index.js";
	import * as Tooltip from "#lib/components/ui/tooltip/index.js";
	import SiteFooter from "#lib/docs/layout/site-footer.svelte";
	import SiteHeader from "#lib/docs/layout/site-header.svelte";
	import { packageManager } from "#lib/docs/package-manager.svelte.js";
	import { siteConfig } from "#lib/docs/site.js";
	import { THEME_STORAGE_KEY } from "#lib/docs/site-themes.js";

	let { children } = $props();

	onMount(() => {
		packageManager.sync();
	});

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
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<meta property="og:site_name" content={siteConfig.name} />
</svelte:head>

<ModeWatcher themeStorageKey={THEME_STORAGE_KEY} />

<Tooltip.Provider>
	<div class="flex min-h-svh flex-col">
		<SiteHeader />
		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
		<SiteFooter />
	</div>
</Tooltip.Provider>

<Toaster />
