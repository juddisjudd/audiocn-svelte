<svelte:options namespace="svg" />

<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";
	import type { SVGAttributes } from "svelte/elements";
	import { cn } from "#lib/utils.js";
	import type { WithSvgElementRef } from "./knob-utils.js";

	export const knobCapVariants = tv({
		base: "[--knob-cap-metal:var(--color-white)] [--knob-cap-shade:var(--color-black)]",
		variants: {
			variant: {
				default: "[--knob-cap-pitch:0.3px]",
				mini: "[--knob-cap-pitch:0.9px]",
			},
		},
		defaultVariants: { variant: "default" },
	});

	export type KnobCapVariant = VariantProps<typeof knobCapVariants>["variant"];

	export type KnobCapProps = WithSvgElementRef<SVGAttributes<SVGGElement>, SVGGElement> & {
		/**
		 * `default` sits inside a KnobScale and marks the value with a dot. `mini`
		 * fills the inside of a KnobTrack and marks it with an engraved line, for
		 * small knobs. Default `default`.
		 */
		variant?: KnobCapVariant;
	};

	/**
	 * Radii of the cap, in view box units: inside a KnobScale by default, or
	 * filling the inside of a KnobTrack when mini. The shadow starts at `haloFrom`
	 * of the halo's radius.
	 */
	const CAP = {
		default: {
			bezel: 25.5,
			face: 22.5,
			halo: 34,
			haloFrom: 0.6,
			rim: 23.3,
		},
		mini: {
			bezel: 32,
			face: 28.2,
			halo: 36,
			haloFrom: 0.8,
			rim: 29.2,
		},
	} as const;
	/** The default cap's indicator dot. */
	const CAP_DOT = { distance: 17, radius: 1.6 } as const;
	/** The mini cap's engraved indicator line, which reads at small sizes. */
	const CAP_LINE = { inner: 8.5, lip: 0.6, outer: 23, width: 3.4 } as const;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import { CENTER, angleFor, pointAt } from "./knob-utils.js";

	let {
		ref = $bindable(null),
		variant = "default",
		class: className,
		...restProps
	}: KnobCapProps = $props();

	const knob = useKnob("KnobCap");
	const uid = $props.id();
	/** An id that is safe inside `url(#…)`. */
	const id = `knob${uid.replaceAll(/[^\w-]/gu, "")}`;
	const angle = $derived(angleFor(knob.position, knob.arc));
	const cap = $derived(CAP[variant]);
	const dot = $derived(pointAt(angle, CAP_DOT.distance));
	const inner = $derived(pointAt(angle, CAP_LINE.inner));
	const outer = $derived(pointAt(angle, CAP_LINE.outer));
</script>

<!--
@component
A brushed aluminium cap in a dark bezel, with a marker that turns with the
value. The metal is `--knob-cap-metal` shaded by `--knob-cap-shade`.
-->
<g
	bind:this={ref}
	class={cn(knobCapVariants({ variant }), className)}
	data-slot="knob-cap"
	data-variant={variant}
	{...restProps}
>
	<defs>
		<filter height="100%" id="{id}-grain" width="100%" x="0" y="0">
			<feTurbulence baseFrequency={0.9} numOctaves={3} seed={7} type="fractalNoise" />
			<feColorMatrix type="saturate" values="0" />
			<feComposite in2="SourceGraphic" operator="in" />
		</filter>
		<radialGradient id="{id}-halo">
			<stop class="[stop-color:var(--knob-cap-shade)]" offset={cap.haloFrom} stop-opacity={0.55} />
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
	<circle cx={CENTER} cy={CENTER} fill="url(#{id}-halo)" r={cap.halo} />
	<circle
		class="fill-(--knob-cap-shade)/85 stroke-(--knob-cap-metal)/15"
		cx={CENTER}
		cy={CENTER}
		r={cap.bezel}
		stroke-width={0.4}
	/>
	<circle cx={CENTER} cy={CENTER} fill="url(#{id}-bezel)" r={cap.bezel} />
	<circle class="fill-(--knob-cap-metal)" cx={CENTER} cy={CENTER} r={cap.rim} />
	<circle cx={CENTER} cy={CENTER} fill="url(#{id}-rim)" r={cap.rim} />
	<!-- SVG has no conic gradient, so the face is HTML with a CSS one. -->
	<foreignObject
		height={cap.face * 2}
		width={cap.face * 2}
		x={CENTER - cap.face}
		y={CENTER - cap.face}
	>
		<div
			class="size-full rounded-full bg-(--knob-cap-metal) bg-[repeating-radial-gradient(circle,var(--knob-cap-brush)_0_var(--knob-cap-pitch),transparent_var(--knob-cap-pitch)_calc(var(--knob-cap-pitch)*2)),conic-gradient(from_15deg,var(--knob-cap-sheen),transparent_9%,var(--knob-cap-sheen)_21%,transparent_32%,var(--knob-cap-sheen-deep)_46%,transparent_58%,var(--knob-cap-sheen)_70%,transparent_83%,var(--knob-cap-sheen))] [--knob-cap-brush:color-mix(in_oklab,var(--knob-cap-shade)_7%,transparent)] [--knob-cap-sheen-deep:color-mix(in_oklab,var(--knob-cap-shade)_50%,transparent)] [--knob-cap-sheen:color-mix(in_oklab,var(--knob-cap-shade)_34%,transparent)]"
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
		r={cap.face}
		transform="rotate({angle} {CENTER} {CENTER})"
	/>
	{#if variant === "default"}
		<circle
			class="fill-(--knob-cap-shade)/85 stroke-(--knob-cap-shade)/45"
			cx={dot.x}
			cy={dot.y}
			data-slot="knob-cap-dot"
			r={CAP_DOT.radius}
			stroke-width={0.35}
		/>
	{:else}
		<!-- Light from above catches the groove's lower wall. -->
		<line
			class="stroke-(--knob-cap-metal)/70"
			stroke-linecap="round"
			stroke-width={CAP_LINE.width}
			x1={inner.x}
			x2={outer.x}
			y1={inner.y + CAP_LINE.lip}
			y2={outer.y + CAP_LINE.lip}
		/>
		<line
			class="stroke-(--knob-cap-shade)/80"
			data-slot="knob-cap-pointer"
			stroke-linecap="round"
			stroke-width={CAP_LINE.width}
			x1={inner.x}
			x2={outer.x}
			y1={inner.y}
			y2={outer.y}
		/>
	{/if}
</g>
