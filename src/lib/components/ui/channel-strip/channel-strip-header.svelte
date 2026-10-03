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

	const strip = getChannelStripContext("ChannelStripHeader");
</script>

<div
	bind:this={ref}
	data-slot="channel-strip-header"
	class={cn(
		"flex min-w-0 items-center gap-2 [grid-area:header]",
		strip.orientation === "vertical" ? "w-full flex-col text-center *:max-w-full" : "flex-wrap",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
