<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		alt = "",
		...restProps
	}: WithElementRef<HTMLImgAttributes> = $props();
</script>

<img
	bind:this={ref}
	{alt}
	data-slot="track-list-item-artwork"
	class={cn("size-9 shrink-0 rounded-md bg-muted object-cover", className)}
	{...restProps}
/>
