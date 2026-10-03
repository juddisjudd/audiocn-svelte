<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TaperInput } from "#lib/audio/taper.js";
	import type { Orientation } from "#lib/audio/types.js";
	import type { AudioSize } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { FaderChangeDetails, FaderVariant } from "./fader-utils.js";

	export const faderVariants = tv({
		base: "group/fader relative flex touch-none gap-2 select-none data-disabled:opacity-50",
		variants: {
			orientation: {
				horizontal: "w-full flex-col",
				vertical: "h-full min-h-32 flex-row justify-center",
			},
			size: {
				default: "[--fader-thumb-size:1rem] [--fader-track-size:0.25rem]",
				lg: "[--fader-thumb-size:1.25rem] [--fader-track-size:0.375rem]",
				sm: "[--fader-thumb-size:0.75rem] [--fader-track-size:0.1875rem]",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
			size: "default",
		},
	});

	export type FaderSize = VariantProps<typeof faderVariants>["size"];

	export type FaderProps = WithElementRef<
		Omit<HTMLAttributes<HTMLDivElement>, "onchange">,
		HTMLDivElement
	> & {
		/** The value in dB. Default `resetValue`. */
		value?: number;
		onValueChange?: (value: number, details: FaderChangeDetails) => void;
		/** Fires when a drag ends, after keyboard input, and on reset. */
		onValueCommit?: (value: number) => void;
		/** Bottom of the range in dB. Default −60. */
		min?: number;
		/** Top of the range in dB. Default +6. */
		max?: number;
		/** Arrow keys and drag resolution in dB. Default 0.5. */
		step?: number;
		/** Shift+arrow and Page Up/Down, in dB. Default 6. */
		largeStep?: number;
		/** Alt+arrow and Alt+drag resolution, in dB. Default 0.1. */
		fineStep?: number;
		/** Value restored by double-clicking the thumb. Default 0. */
		resetValue?: number;
		/** Position law. Default `linear`. */
		taper?: TaperInput;
		/** Where the range fill starts. Set 0 for a bipolar gain. Default `min`. */
		origin?: number;
		/** Values the thumb snaps to while dragging. Default `[0]`. */
		detents?: number[];
		/** The bottom position reports `-Infinity`. Default false. */
		silenceAtMin?: boolean;
		/** The mouse wheel adjusts the value while the fader is focused. Default false. */
		allowWheel?: boolean;
		orientation?: Orientation;
		/** `console` has a wide cap thumb. Default `default`. */
		variant?: FaderVariant;
		size?: AudioSize;
		/** Formats the value for `FaderValue` and assistive technology. */
		format?: (db: number) => string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { clamp, SILENCE_DB } from "#lib/audio/decibels.js";
	import { resolveTaper } from "#lib/audio/taper.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import FaderRange from "./fader-range.svelte";
	import FaderThumb from "./fader-thumb.svelte";
	import FaderTrack from "./fader-track.svelte";
	import {
		DEFAULT_DETENTS,
		DEFAULT_MAX_DB,
		DEFAULT_MIN_DB,
		DETENT_SNAP,
		defaultFormat,
		roundValue,
		setFader,
	} from "./fader-utils.js";

	let {
		ref = $bindable(null),
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		min = DEFAULT_MIN_DB,
		max = DEFAULT_MAX_DB,
		resetValue = 0,
		value = $bindable(clamp(resetValue, min, max)),
		onValueChange,
		onValueCommit,
		step = 0.5,
		largeStep = 6,
		fineStep = 0.1,
		taper = "linear",
		origin,
		detents = DEFAULT_DETENTS,
		silenceAtMin = false,
		allowWheel = false,
		orientation: orientationProp,
		variant = "default",
		size: sizeProp,
		format = defaultFormat,
		disabled: disabledProp,
		class: className,
		children,
		...restProps
	}: FaderProps = $props();

	// Orientation, size and disabled, from props or the surrounding strip.
	const config = useAudioConfig();
	const disabled = $derived(disabledProp ?? config.disabled ?? false);
	const orientation = $derived(orientationProp ?? config.orientation ?? "horizontal");
	const size = $derived(sizeProp ?? config.size ?? "default");

	let dragging = $state(false);
	let labelId = $state<string | undefined>();

	const taperFn = $derived(resolveTaper(taper, min, max));

	const toPosition = (db: number) => (db === SILENCE_DB ? 0 : taperFn.toPosition(db));

	const position = $derived(toPosition(value));
	const originPosition = $derived(toPosition(clamp(origin ?? min, min, max)));

	const change = (db: number, details: FaderChangeDetails) => {
		if (db === value) {
			return;
		}
		value = db;
		onValueChange?.(db, details);
	};

	const commit = (db: number) => {
		onValueCommit?.(db);
	};

	const quantize = (db: number, increment: number) => {
		if (db === SILENCE_DB) {
			return silenceAtMin ? SILENCE_DB : min;
		}
		const stepped = min + Math.round((db - min) / increment) * increment;
		return roundValue(clamp(stepped, min, max));
	};

	const fromPosition = (next: number, fine: boolean) => {
		if (silenceAtMin && next <= 0) {
			return SILENCE_DB;
		}
		for (const detent of detents) {
			if (Math.abs(next - toPosition(detent)) < DETENT_SNAP) {
				return detent;
			}
		}
		return quantize(taperFn.toValue(next), fine ? fineStep : step);
	};

	const nudge = (direction: number, increment: number) => {
		if (value === SILENCE_DB) {
			return direction > 0 ? min : SILENCE_DB;
		}
		if (silenceAtMin && direction < 0 && value <= min) {
			return SILENCE_DB;
		}
		return quantize(value + direction * increment, Math.min(increment, step));
	};

	const incrementFor = (event: KeyboardEvent) => {
		if (event.altKey) {
			return fineStep;
		}
		return event.shiftKey ? largeStep : step;
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (disabled) {
			return;
		}
		const increment = incrementFor(event);
		const targets: Record<string, () => number> = {
			ArrowDown: () => nudge(-1, increment),
			ArrowLeft: () => nudge(-1, increment),
			ArrowRight: () => nudge(1, increment),
			ArrowUp: () => nudge(1, increment),
			End: () => max,
			Home: () => (silenceAtMin ? SILENCE_DB : min),
			PageDown: () => nudge(-1, largeStep),
			PageUp: () => nudge(1, largeStep),
		};
		const target = targets[event.key];
		if (!target) {
			return;
		}
		event.preventDefault();
		const next = target();
		change(next, { event, reason: "keyboard" });
		commit(next);
	};

	// Mouse-wheel adjustment while focused, with a non-passive listener.
	$effect(() => {
		const root = ref;
		if (!(root && allowWheel)) {
			return;
		}
		const listener = (event: WheelEvent) => {
			const focused = root.contains(document.activeElement);
			if (disabled || !focused || event.deltaY === 0) {
				return;
			}
			event.preventDefault();
			const next = nudge(event.deltaY < 0 ? 1 : -1, event.altKey ? fineStep : step);
			change(next, { event, reason: "wheel" });
			commit(next);
		};
		root.addEventListener("wheel", listener, { passive: false });
		return () => {
			root.removeEventListener("wheel", listener);
		};
	});

	setFader({
		get ariaLabel() {
			return ariaLabel ?? undefined;
		},
		get ariaLabelledBy() {
			return ariaLabelledBy ?? labelId;
		},
		get value() {
			return value;
		},
		get position() {
			return position;
		},
		get originPosition() {
			return originPosition;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get resetValue() {
			return resetValue;
		},
		get orientation() {
			return orientation;
		},
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
		get disabled() {
			return disabled;
		},
		get taper() {
			return taperFn;
		},
		get dragging() {
			return dragging;
		},
		setDragging: (next) => {
			dragging = next;
		},
		registerLabel: (id) => {
			labelId = id;
			return () => {
				if (labelId === id) {
					labelId = undefined;
				}
			};
		},
		format: (db) => format(db),
		fromPosition,
		change,
		commit,
		handleKeyDown,
	});
</script>

<div
	bind:this={ref}
	data-slot="fader"
	data-at-detent={detents.includes(value) ? "" : undefined}
	data-disabled={disabled ? "" : undefined}
	data-dragging={dragging ? "" : undefined}
	data-orientation={orientation}
	data-silent={value === SILENCE_DB ? "" : undefined}
	data-size={size}
	data-variant={variant}
	class={cn(faderVariants({ orientation, size }), className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<FaderTrack>
			<FaderRange />
			<FaderThumb />
		</FaderTrack>
	{/if}
</div>
