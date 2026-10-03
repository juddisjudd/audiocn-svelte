<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type ParameterSliderValueProps = WithElementRef<
		HTMLAttributes<HTMLSpanElement>,
		HTMLSpanElement
	>;
</script>

<script lang="ts">
	import { useParameterSlider, widestValue } from "./parameter-slider-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ParameterSliderValueProps = $props();

	const slider = useParameterSlider("ParameterSliderValue");
	const valueWidth = $derived(widestValue(slider.format, slider.taper, slider.quantize));
</script>

<span
	bind:this={ref}
	data-slot="parameter-slider-value"
	class={cn(
		"inline-block min-w-(--parameter-value-width) text-end font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums",
		className
	)}
	style:--parameter-value-width="{valueWidth}ch"
	{...restProps}
>
	{slider.format(slider.value)}
</span>
