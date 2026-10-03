<svelte:options namespace="svg" />

<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	import type { WithSvgElementRef } from "./knob-utils.js";

	export type KnobScaleProps = WithSvgElementRef<
		Omit<SVGAttributes<SVGGElement>, "format">,
		SVGGElement
	> & {
		/** Divisions across the arc; draws `ticks + 1` marks. Default 50. */
		ticks?: number;
		/** Every nth tick is long. Default 5. */
		majorEvery?: number;
		/** Every nth tick is numbered; 0 hides the numbers. Default 10. */
		labelEvery?: number;
		/** Text for each number. Default: the knob's `format`. */
		format?: (value: number) => string;
	};

	/** Radii of the volume dial, in view box units. */
	const SCALE = {
		label: 47.5,
		labelSize: 4.5,
		majorInner: 34.5,
		majorOuter: 43.5,
		minorInner: 35.5,
		minorOuter: 40.5,
	} as const;
	/** Ticks this close to the lit range's ends still count as lit. */
	const TICK_EPSILON = 1e-9;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import { angleFor, pointAt, roundValue } from "./knob-utils.js";

	let {
		ref = $bindable(null),
		ticks = 50,
		majorEvery = 5,
		labelEvery = 10,
		format: formatProp,
		class: className,
		...restProps
	}: KnobScaleProps = $props();

	const knob = useKnob("KnobScale");
	const formatLabel = $derived(formatProp ?? knob.format);
	const litFrom = $derived(Math.min(knob.originPosition, knob.position) - TICK_EPSILON);
	const litTo = $derived(Math.max(knob.originPosition, knob.position) + TICK_EPSILON);
	const count = $derived(Math.max(1, Math.round(ticks)));
	// One step for the long ticks drawn and the detents they click on.
	const majorStep = $derived(Math.max(1, Math.round(majorEvery)));

	$effect(() => {
		const majors: number[] = [];
		for (let index = 0; index <= count; index += majorStep) {
			majors.push(index / count);
		}
		knob.setDetents(majors);
		return () => {
			knob.setDetents(null);
		};
	});

	const marks = $derived(
		Array.from({ length: count + 1 }, (_, index) => {
			const tickPosition = index / count;
			const angle = angleFor(tickPosition, knob.arc);
			const major = index % majorStep === 0;
			return {
				index,
				inner: pointAt(angle, major ? SCALE.majorInner : SCALE.minorInner),
				lit: tickPosition >= litFrom && tickPosition <= litTo,
				major,
				outer: pointAt(angle, major ? SCALE.majorOuter : SCALE.minorOuter),
			};
		})
	);

	const labels = $derived(
		labelEvery > 0
			? Array.from({ length: Math.floor(count / labelEvery) + 1 }, (_, index) => {
					const tickPosition = (index * labelEvery) / count;
					const angle = angleFor(tickPosition, knob.arc);
					const { x, y } = pointAt(angle, SCALE.label);
					return {
						angle,
						text: formatLabel(roundValue(knob.taper.toValue(tickPosition))),
						tickPosition,
						x,
						y,
					};
				})
			: []
	);
</script>

<!--
@component
Tick marks and numbers around the dial, lit from `origin` to the value.
-->
<g bind:this={ref} class={className} data-slot="knob-scale" {...restProps}>
	{#each marks as mark (mark.index)}
		<line
			class="stroke-muted-foreground/45 data-major:stroke-muted-foreground data-active:stroke-foreground data-major:data-active:stroke-foreground"
			data-active={mark.lit ? "" : undefined}
			data-major={mark.major ? "" : undefined}
			data-slot="knob-tick"
			stroke-width={mark.major ? 1.1 : 0.55}
			x1={mark.inner.x}
			x2={mark.outer.x}
			y1={mark.inner.y}
			y2={mark.outer.y}
		/>
	{/each}
	{#each labels as label (label.tickPosition)}
		<text
			class="fill-muted-foreground"
			data-slot="knob-scale-label"
			dominant-baseline="central"
			font-size={SCALE.labelSize}
			text-anchor="middle"
			transform="rotate({label.angle} {label.x} {label.y})"
			x={label.x}
			y={label.y}>{label.text}</text
		>
	{/each}
</g>
