<svelte:options namespace="svg" />

<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	import { cn } from "#lib/utils.js";
	import type { WithSvgElementRef } from "./knob-utils.js";

	export type KnobTrackProps = WithSvgElementRef<SVGAttributes<SVGPathElement>, SVGPathElement>;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import { arcPath } from "./knob-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: KnobTrackProps = $props();

	const knob = useKnob("KnobTrack");
</script>

<path
	bind:this={ref}
	class={cn("stroke-input", className)}
	d={arcPath(-knob.arc / 2, knob.arc / 2)}
	data-slot="knob-track"
	fill="none"
	stroke-linecap="round"
	stroke-width={8}
	{...restProps}
/>
