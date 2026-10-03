<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";
	import { getChannelStripContext } from "./channel-strip-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const strip = getChannelStripContext("ChannelStripMeter");
</script>

<div
	bind:this={ref}
	data-slot="channel-strip-meter"
	class={cn(
		"flex min-h-0 min-w-0 [grid-area:meter]",
		strip.orientation === "horizontal" ? "w-full items-center" : "h-full justify-center",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
