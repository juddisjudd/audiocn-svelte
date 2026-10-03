<svelte:options namespace="svg" />

<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	import { cn } from "#lib/utils.js";
	import type { WithSvgElementRef } from "./knob-utils.js";

	export type KnobPointerProps = WithSvgElementRef<SVGAttributes<SVGLineElement>, SVGLineElement>;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import { CENTER, RADIUS, angleFor, pointAt } from "./knob-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: KnobPointerProps = $props();

	const knob = useKnob("KnobPointer");
	const angle = $derived(angleFor(knob.position, knob.arc));
	const inner = $derived(pointAt(angle, RADIUS * 0.3));
	const outer = $derived(pointAt(angle, RADIUS * 0.72));
</script>

<circle
	class="fill-muted stroke-border"
	cx={CENTER}
	cy={CENTER}
	r={RADIUS * 0.8}
	stroke-width={1}
/>
<line
	bind:this={ref}
	class={cn("stroke-foreground", className)}
	data-slot="knob-pointer"
	stroke-linecap="round"
	stroke-width={6}
	x1={inner.x}
	x2={outer.x}
	y1={inner.y}
	y2={outer.y}
	{...restProps}
/>
