<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type ParameterSliderLabelProps = WithElementRef<
		HTMLAttributes<HTMLSpanElement>,
		HTMLSpanElement
	>;
</script>

<script lang="ts">
	import { useParameterSlider } from "./parameter-slider-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: ParameterSliderLabelProps = $props();

	const slider = useParameterSlider("ParameterSliderLabel");
</script>

<span
	bind:this={ref}
	id={slider.labelId}
	data-slot="parameter-slider-label"
	class={cn("mr-auto text-sm font-medium", className)}
	{...restProps}
>
	{@render children?.()}
</span>
