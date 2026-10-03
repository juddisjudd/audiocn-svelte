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

	getMixerContext("MixerEmpty");
</script>

<!-- @component Shown when `MixerChannels` renders nothing. -->
<div
	bind:this={ref}
	data-slot="mixer-empty"
	class={cn(
		"hidden min-h-24 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground [grid-area:channels] group-has-[[data-slot=mixer-channels]:empty]/mixer:flex",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
