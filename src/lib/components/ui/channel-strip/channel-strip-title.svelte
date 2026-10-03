<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";
	import { getChannelStripContext } from "./channel-strip-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();

	const strip = getChannelStripContext("ChannelStripTitle");
</script>

<span
	bind:this={ref}
	id={strip.titleId}
	data-slot="channel-strip-title"
	class={cn("truncate text-sm leading-tight font-medium", className)}
	{...restProps}
>
	{@render children?.()}
</span>
