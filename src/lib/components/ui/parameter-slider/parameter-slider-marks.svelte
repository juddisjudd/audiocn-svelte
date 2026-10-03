<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type ParameterSliderMarksProps = WithElementRef<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>;
</script>

<script lang="ts">
	import { useParameterSlider } from "./parameter-slider-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ParameterSliderMarksProps = $props();

	const slider = useParameterSlider("ParameterSliderMarks");
</script>

{#if slider.marks && slider.marks.length > 0}
	<div
		bind:this={ref}
		aria-hidden="true"
		data-slot="parameter-slider-marks"
		class={cn("relative mx-2 h-4 text-[0.625rem] text-muted-foreground", className)}
		{...restProps}
	>
		{#each slider.marks as mark (mark.value)}
			<span
				class="absolute top-0 left-(--mark-position) -translate-x-1/2 whitespace-nowrap tabular-nums"
				style:--mark-position="{slider.taper.toPosition(mark.value) * 100}%"
			>
				{mark.label ?? slider.format(mark.value)}
			</span>
		{/each}
	</div>
{/if}
