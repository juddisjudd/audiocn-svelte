<script lang="ts" module>
	import type { HTMLImgAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerArtworkProps = WithElementRef<HTMLImgAttributes, HTMLImageElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		alt = "",
		class: className,
		...restProps
	}: AudioPlayerArtworkProps = $props();
</script>

<img
	bind:this={ref}
	{alt}
	class={cn("size-12 shrink-0 rounded-lg bg-muted object-cover", className)}
	data-slot="audio-player-artwork"
	{...restProps}
/>
