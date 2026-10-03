<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";
	import { getMixerContext } from "./mixer-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const mixer = getMixerContext("MixerSeparator");
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	data-slot="mixer-separator"
	class={cn(
		"shrink-0 bg-border [grid-area:separator]",
		mixer.orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
