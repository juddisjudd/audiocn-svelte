<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";
	import type { HTMLAttributes } from "svelte/elements";
	import type { AudioSize } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { KnobChangeDetails, KnobDragDirection } from "./knob-utils.js";

	export const knobVariants = tv({
		base: "group/knob inline-flex flex-col items-center gap-1.5 select-none data-disabled:opacity-50",
		variants: {
			size: {
				default: "[--knob-size:3rem]",
				lg: "[--knob-size:4rem]",
				sm: "[--knob-size:2.25rem]",
			},
		},
		defaultVariants: { size: "default" },
	});

	export type KnobSize = VariantProps<typeof knobVariants>["size"];

	export type KnobProps = WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "onchange">> & {
		/** The value. Default `resetValue` or `min`. */
		value?: number;
		onValueChange?: (value: number, details: KnobChangeDetails) => void;
		onValueCommit?: (value: number) => void;
		/** Default 0. */
		min?: number;
		/** Default 100. */
		max?: number;
		/** Default 1. */
		step?: number;
		/** Default 10. */
		largeStep?: number;
		/** Shift+drag, Shift+wheel and Alt+arrow. Default: `step / 10`. */
		fineStep?: number;
		/** Double-click or Alt+click restores this. Default: the first `value`, or `min`. */
		resetValue?: number;
		/** Where the arc starts; the centre for bipolar knobs. Default `min`. */
		origin?: number;
		/** Sweep in degrees. Default 270. */
		arc?: number;
		/** How dragging turns the knob. Default `vertical`. */
		dragDirection?: KnobDragDirection;
		/** Pixels of vertical or horizontal drag for the full range. Default 200. */
		sensitivity?: number;
		/** Default `linear`. */
		scale?: "linear" | "log";
		/** The wheel adjusts the value while focused. Default false. */
		allowWheel?: boolean;
		/**
		 * Plays a soft click on each graduation: KnobScale's long ticks, or every
		 * `largeStep` without a scale. Default false.
		 */
		clickSound?: boolean;
		format?: (value: number) => string;
		/** Reads a typed value. Default: the first number, with "k" as thousands. */
		parse?: (text: string) => number | null;
		size?: AudioSize;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { clamp } from "#lib/audio/decibels.js";
	import { linearTaper, logTaper } from "#lib/audio/taper.js";
	import type { Taper } from "#lib/audio/types.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { setKnob } from "./knob-context.svelte.js";
	import {
		FINE_FACTOR,
		parseKnobValue,
		playClick,
		reachesDetent,
		reachesMultiple,
		roundValue,
		widestValue,
	} from "./knob-utils.js";
	import KnobDial from "./knob-dial.svelte";
	import KnobPointer from "./knob-pointer.svelte";
	import KnobRange from "./knob-range.svelte";
	import KnobTrack from "./knob-track.svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		onValueChange,
		onValueCommit,
		min = 0,
		max = 100,
		step = 1,
		largeStep = 10,
		fineStep,
		resetValue,
		origin,
		arc = 270,
		dragDirection = "vertical",
		sensitivity = 200,
		scale = "linear",
		allowWheel = false,
		clickSound = false,
		format = String,
		parse = parseKnobValue,
		size: sizeProp,
		disabled: disabledProp,
		class: className,
		children,
		...restProps
	}: KnobProps = $props();

	const config = useAudioConfig();
	const disabled = $derived(disabledProp ?? config.disabled ?? false);
	const size = $derived(sizeProp ?? config.size ?? "default");

	const initialValue = untrack(() => {
		if (value === undefined) {
			value = clamp(resetValue ?? min, min, max);
		}
		return value;
	});
	const current = $derived(value ?? initialValue);
	const reset = $derived(resetValue ?? initialValue);
	const labelId = $props.id();

	const taper: Taper = $derived(scale === "log" ? logTaper(min, max) : linearTaper(min, max));

	// Clicks land on KnobScale's long ticks, or every largeStep without one.
	let detents = $state<readonly number[] | null>(null);
	const clicksBetween = $derived.by(() => {
		if (!clickSound) {
			return null;
		}
		if (detents) {
			const marks = detents;
			return (from: number, to: number) =>
				reachesDetent(marks, taper.toPosition(from), taper.toPosition(to));
		}
		return (from: number, to: number) => reachesMultiple(from, to, min, largeStep);
	});

	const change = (next: number, details: KnobChangeDetails) => {
		const previous = current;
		if (next === previous) {
			return;
		}
		value = next;
		onValueChange?.(next, details);
		if (clicksBetween?.(previous, next)) {
			playClick();
		}
	};

	const quantize = (next: number, increment: number) =>
		roundValue(clamp(min + Math.round((next - min) / increment) * increment, min, max));

	const position = $derived(taper.toPosition(current));
	const originValue = $derived(clamp(origin ?? min, min, max));
	const originPosition = $derived(taper.toPosition(originValue));

	let editing = $state(false);

	const valueWidth = $derived(widestValue(format, taper, (next) => quantize(next, step)));

	setKnob({
		get value() {
			return current;
		},
		get position() {
			return position;
		},
		get originPosition() {
			return originPosition;
		},
		get arc() {
			return arc;
		},
		labelId,
		get disabled() {
			return disabled;
		},
		get format() {
			return format;
		},
		get parse() {
			return parse;
		},
		get valueWidth() {
			return valueWidth;
		},
		get editing() {
			return editing;
		},
		setEditing: (next) => {
			editing = next;
		},
		change,
		commit: (next) => onValueCommit?.(next),
		get dragDirection() {
			return dragDirection;
		},
		get fineStep() {
			return fineStep ?? step * FINE_FACTOR;
		},
		get largeStep() {
			return largeStep;
		},
		get max() {
			return max;
		},
		get min() {
			return min;
		},
		quantize,
		get resetValue() {
			return reset;
		},
		get sensitivity() {
			return sensitivity;
		},
		get step() {
			return step;
		},
		get taper() {
			return taper;
		},
		get allowWheel() {
			return allowWheel;
		},
		setDetents: (positions) => {
			detents = positions;
		},
	});
</script>

<div
	bind:this={ref}
	class={cn(knobVariants({ size }), className)}
	data-at-origin={current === originValue ? "" : undefined}
	data-disabled={disabled ? "" : undefined}
	data-size={size}
	data-slot="knob"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobPointer />
		</KnobDial>
	{/if}
</div>
