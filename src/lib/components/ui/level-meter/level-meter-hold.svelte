<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> = $props();

	const context = useLevelMeterContext("LevelMeterHold");
	const horizontal = $derived(context.orientation === "horizontal");
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	data-slot="level-meter-hold"
	class={cn(
		"pointer-events-none absolute inset-0 opacity-[calc(var(--meter-hold)_*_50)]",
		horizontal
			? "translate-x-[calc((var(--meter-hold)_-_1)_*_100%)]"
			: "translate-y-[calc((1_-_var(--meter-hold))_*_100%)]"
	)}
	{...restProps}
>
	<div
		class={cn(
			"absolute bg-foreground/80",
			horizontal ? "inset-y-0 right-0 w-0.5" : "inset-x-0 top-0 h-0.5",
			className
		)}
	></div>
</div>
