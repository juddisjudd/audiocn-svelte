<svelte:options namespace="svg" />

<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	import { cn } from "#lib/utils.js";
	import type { WithSvgElementRef } from "./knob-utils.js";

	export type KnobRangeProps = WithSvgElementRef<SVGAttributes<SVGPathElement>, SVGPathElement>;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import { angleFor, arcPath } from "./knob-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: KnobRangeProps = $props();

	const knob = useKnob("KnobRange");
</script>

<path
	bind:this={ref}
	class={cn("stroke-primary", className)}
	d={arcPath(angleFor(knob.originPosition, knob.arc), angleFor(knob.position, knob.arc))}
	data-slot="knob-range"
	fill="none"
	stroke-linecap="round"
	stroke-width={8}
	{...restProps}
/>
