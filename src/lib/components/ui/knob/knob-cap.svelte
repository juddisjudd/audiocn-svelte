<svelte:options namespace="svg" />

<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	import { cn } from "#lib/utils.js";
	import type { WithSvgElementRef } from "./knob-utils.js";

	export type KnobCapProps = WithSvgElementRef<SVGAttributes<SVGGElement>, SVGGElement>;

	const CAP = {
		bezel: 25.5,
		dot: 1.6,
		dotDistance: 17,
		face: 22.5,
		halo: 34,
		rim: 23.3,
	} as const;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import { CENTER, angleFor, pointAt } from "./knob-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: KnobCapProps = $props();

	const knob = useKnob("KnobCap");
	const uid = $props.id();
	/** An id that is safe inside `url(#…)`. */
	const id = `knob${uid.replaceAll(/[^\w-]/gu, "")}`;
	const angle = $derived(angleFor(knob.position, knob.arc));
	const dot = $derived(pointAt(angle, CAP.dotDistance));
</script>

<!--
@component
A brushed aluminium cap in a dark bezel, with a dot that turns with the
value. The metal is `--knob-cap-metal` shaded by `--knob-cap-shade`.
-->
<g
	bind:this={ref}
	class={cn(
		"[--knob-cap-metal:var(--color-white)] [--knob-cap-shade:var(--color-black)]",
		className
	)}
	data-slot="knob-cap"
	{...restProps}
>
	<defs>
		<filter height="100%" id="{id}-grain" width="100%" x="0" y="0">
			<feTurbulence baseFrequency={0.9} numOctaves={3} seed={7} type="fractalNoise" />
			<feColorMatrix type="saturate" values="0" />
			<feComposite in2="SourceGraphic" operator="in" />
		</filter>
		<radialGradient id="{id}-halo">
			<stop class="[stop-color:var(--knob-cap-shade)]" offset="0.6" stop-opacity={0.55} />
			<stop class="[stop-color:var(--knob-cap-shade)]" offset="1" stop-opacity={0} />
		</radialGradient>
		<!-- Light from above: the bezel brightens at the top, the rim at the bottom. -->
		<linearGradient id="{id}-bezel" x1="0" x2="0" y1="0" y2="1">
			<stop class="[stop-color:var(--knob-cap-metal)]" offset="0" stop-opacity={0.16} />
			<stop class="[stop-color:var(--knob-cap-metal)]" offset="1" stop-opacity={0} />
		</linearGradient>
		<linearGradient id="{id}-rim" x1="0" x2="0" y1="0" y2="1">
			<stop class="[stop-color:var(--knob-cap-shade)]" offset="0" stop-opacity={0.62} />
			<stop class="[stop-color:var(--knob-cap-shade)]" offset="1" stop-opacity={0.08} />
		</linearGradient>
	</defs>
	<circle cx={CENTER} cy={CENTER} fill="url(#{id}-halo)" r={CAP.halo} />
	<circle
		class="fill-(--knob-cap-shade)/85 stroke-(--knob-cap-metal)/15"
		cx={CENTER}
		cy={CENTER}
		r={CAP.bezel}
		stroke-width={0.4}
	/>
	<circle cx={CENTER} cy={CENTER} fill="url(#{id}-bezel)" r={CAP.bezel} />
	<circle class="fill-(--knob-cap-metal)" cx={CENTER} cy={CENTER} r={CAP.rim} />
	<circle cx={CENTER} cy={CENTER} fill="url(#{id}-rim)" r={CAP.rim} />
	<!-- SVG has no conic gradient, so the face is HTML with a CSS one. -->
	<foreignObject
		height={CAP.face * 2}
		width={CAP.face * 2}
		x={CENTER - CAP.face}
		y={CENTER - CAP.face}
	>
		<div
			class="size-full rounded-full bg-(--knob-cap-metal) bg-[repeating-radial-gradient(circle,var(--knob-cap-brush)_0_0.3px,transparent_0.3px_0.6px),conic-gradient(from_15deg,var(--knob-cap-sheen),transparent_9%,var(--knob-cap-sheen)_21%,transparent_32%,var(--knob-cap-sheen-deep)_46%,transparent_58%,var(--knob-cap-sheen)_70%,transparent_83%,var(--knob-cap-sheen))] [--knob-cap-brush:color-mix(in_oklab,var(--knob-cap-shade)_7%,transparent)] [--knob-cap-sheen-deep:color-mix(in_oklab,var(--knob-cap-shade)_50%,transparent)] [--knob-cap-sheen:color-mix(in_oklab,var(--knob-cap-shade)_34%,transparent)]"
			data-slot="knob-cap-face"
		></div>
	</foreignObject>
	<circle
		cx={CENTER}
		cy={CENTER}
		data-slot="knob-cap-grain"
		filter="url(#{id}-grain)"
		opacity={0.25}
		pointer-events="none"
		r={CAP.face}
		transform="rotate({angle} {CENTER} {CENTER})"
	/>
	<circle
		class="fill-(--knob-cap-shade)/85 stroke-(--knob-cap-shade)/45"
		cx={dot.x}
		cy={dot.y}
		data-slot="knob-cap-dot"
		r={CAP.dot}
		stroke-width={0.35}
	/>
</g>
