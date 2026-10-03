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

	const strip = getChannelStripContext("ChannelStripFader");
</script>

<div
	bind:this={ref}
	data-slot="channel-strip-fader"
	class={cn(
		"flex min-h-0 min-w-0 [grid-area:fader] [&_[data-slot=fader-control]]:p-0 [&_[data-slot=fader-scale]]:p-0",
		strip.orientation === "horizontal"
			? "w-full items-center [&_[data-slot=fader-control]:only-child]:my-[calc((var(--fader-track-size)-var(--fader-thumb-size))/2)]"
			: "h-full justify-center [&_[data-slot=fader-control]:only-child]:mx-[calc((var(--fader-track-size)-var(--fader-thumb-size))/2)]",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
