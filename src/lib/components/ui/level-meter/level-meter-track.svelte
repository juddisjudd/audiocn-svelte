<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> = $props();

	const context = useLevelMeterContext("LevelMeterTrack");
	const horizontal = $derived(context.orientation === "horizontal");
</script>

<div
	bind:this={ref}
	data-orientation={context.orientation}
	data-slot="level-meter-track"
	class={cn(
		"relative overflow-hidden rounded-full bg-muted",
		horizontal ? "h-(--meter-thickness) w-full" : "h-full w-(--meter-thickness)",
		className
	)}
	{...restProps}
>
	{#if context.variant === "segmented"}
		<div
			aria-hidden="true"
			class="absolute inset-0 bg-(image:--meter-fill) mask-(--meter-mask) opacity-20"
			data-slot="level-meter-segments"
		></div>
	{/if}
	{@render children?.()}
</div>
