<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type ParameterSliderDescriptionProps = WithElementRef<
		HTMLAttributes<HTMLParagraphElement>,
		HTMLParagraphElement
	>;
</script>

<script lang="ts">
	import { useParameterSlider } from "./parameter-slider-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: ParameterSliderDescriptionProps = $props();

	const slider = useParameterSlider("ParameterSliderDescription");
</script>

<p
	bind:this={ref}
	id={slider.descriptionId}
	data-slot="parameter-slider-description"
	class={cn("text-xs text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</p>
