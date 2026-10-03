<script lang="ts">
	import type { Component } from "svelte";
	import type { Attachment } from "svelte/attachments";
	import { Skeleton } from "#lib/components/ui/skeleton/index.js";
	import { cn } from "#lib/utils.js";
	import { hasTile, loadTile, TILES, type TileName } from "./tiles.js";

	/** Tiles start loading this far before they scroll into view. */
	const PRELOAD_MARGIN = "200px";

	let { name }: { name: TileName } = $props();

	let Tile = $state<Component>();

	const exists = $derived(hasTile(name));

	// Load a tile when it nears the viewport, so demo audio below the fold costs nothing.
	const loadWhenNear: Attachment<HTMLElement> = (element) => {
		if (!exists) {
			return;
		}
		const requested = name;
		let cancelled = false;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					observer.disconnect();
					loadTile(requested)?.then((module) => {
						if (!cancelled) {
							Tile = module.default;
						}
					});
				}
			},
			{ rootMargin: PRELOAD_MARGIN }
		);
		observer.observe(element);
		return () => {
			cancelled = true;
			observer.disconnect();
		};
	};
</script>

<div {@attach loadWhenNear} class="@container flex w-full min-w-0 justify-center">
	{#if Tile}
		<Tile />
	{:else if exists}
		<Skeleton class={cn("w-full", TILES[name].height)} />
	{:else}
		<div
			data-slot="showcase-placeholder"
			data-tile={name}
			class={cn(
				"flex w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground",
				TILES[name].height
			)}
		>
			Being ported
		</div>
	{/if}
</div>
