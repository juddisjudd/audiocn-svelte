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

	const mixer = getMixerContext("MixerMaster");
</script>

<div
	bind:this={ref}
	data-slot="mixer-master"
	class={cn(
		"flex min-h-0 min-w-0 [grid-area:master]",
		mixer.orientation === "horizontal" ? "flex-col" : "flex-row",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
