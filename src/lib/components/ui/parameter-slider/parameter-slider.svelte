<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { ParameterChangeDetails, ParameterMark } from "./parameter-slider-utils.js";

	export type ParameterSliderProps = WithElementRef<
		Omit<HTMLAttributes<HTMLDivElement>, "onchange">,
		HTMLDivElement
	> & {
		/** Default `resetValue`, or `min`. */
		value?: number;
		onValueChange?: (value: number, details: ParameterChangeDetails) => void;
		/** Fires when a drag ends, after keyboard input, typing and reset. */
		onValueCommit?: (value: number) => void;
		/** Default 0. */
		min?: number;
		/** Default 100. */
		max?: number;
		/** Default 1. */
		step?: number;
		/** Shift+arrow and Page Up/Down. Default 10. */
		largeStep?: number;
		/** Suffix such as "ms", "dB" or "Hz". */
		unit?: string;
		/** Digits after the decimal point. Default: from `step`. */
		decimals?: number;
		/** `log` suits frequency and time. Default `linear`. */
		scale?: "linear" | "log";
		/** Where the fill starts; the middle of a bipolar range. Default `min`. */
		origin?: number;
		/** Value restored by reset and double-click. Default: the first `value`, or `min`. */
		resetValue?: number;
		marks?: ParameterMark[];
		format?: (value: number) => string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { clamp } from "#lib/audio/decibels.js";
	import { linearTaper, logTaper } from "#lib/audio/taper.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { decimalsOf, roundValue, setParameterSlider } from "./parameter-slider-utils.js";

	const uid = $props.id();

	let {
		ref = $bindable(null),
		min = 0,
		max = 100,
		resetValue: resetValueProp,
		value = $bindable(clamp(resetValueProp ?? min, min, max)),
		onValueChange,
		onValueCommit,
		step = 1,
		largeStep = 10,
		unit,
		decimals: decimalsProp,
		scale = "linear",
		origin,
		marks,
		format: formatProp,
		disabled: disabledProp,
		class: className,
		children,
		...restProps
	}: ParameterSliderProps = $props();

	const config = useAudioConfig();
	const disabled = $derived(disabledProp ?? config.disabled ?? false);
	// The first value stands in for a default value.
	const initialValue = untrack(() => value);
	const resetValue = $derived(resetValueProp ?? initialValue);
	const decimals = $derived(decimalsProp ?? decimalsOf(step));
	const labelId = `${uid}-label`;
	const descriptionId = `${uid}-description`;

	const taper = $derived(scale === "log" ? logTaper(min, max) : linearTaper(min, max));

	const format = (next: number) => {
		if (formatProp) {
			return formatProp(next);
		}
		const text = next.toFixed(decimals);
		return unit ? `${text} ${unit}` : text;
	};

	const quantize = (next: number) => {
		const stepped = min + Math.round((next - min) / step) * step;
		return roundValue(clamp(stepped, min, max));
	};

	const change = (next: number, details: ParameterChangeDetails) => {
		if (next === value) {
			return;
		}
		value = next;
		onValueChange?.(next, details);
	};

	const commit = (next: number) => {
		onValueCommit?.(next);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (disabled) {
			return;
		}
		const increment = event.shiftKey ? largeStep : step;
		let next: number | null = null;
		switch (event.key) {
			case "ArrowUp":
			case "ArrowRight": {
				next = value + increment;
				break;
			}
			case "ArrowDown":
			case "ArrowLeft": {
				next = value - increment;
				break;
			}
			case "PageUp": {
				next = value + largeStep;
				break;
			}
			case "PageDown": {
				next = value - largeStep;
				break;
			}
			case "Home": {
				next = min;
				break;
			}
			case "End": {
				next = max;
				break;
			}
			default: {
				break;
			}
		}
		if (next === null) {
			return;
		}
		event.preventDefault();
		const quantized = quantize(next);
		change(quantized, { event, reason: "keyboard" });
		commit(quantized);
	};

	const position = $derived(taper.toPosition(value));
	const originPosition = $derived(taper.toPosition(clamp(origin ?? min, min, max)));

	setParameterSlider({
		get value() {
			return value;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get step() {
			return step;
		},
		get largeStep() {
			return largeStep;
		},
		get unit() {
			return unit;
		},
		get decimals() {
			return decimals;
		},
		get resetValue() {
			return resetValue;
		},
		get position() {
			return position;
		},
		get originPosition() {
			return originPosition;
		},
		get taper() {
			return taper;
		},
		get disabled() {
			return disabled;
		},
		get marks() {
			return marks;
		},
		labelId,
		descriptionId,
		format,
		quantize,
		change,
		commit,
		handleKeyDown,
	});
</script>

<div
	bind:this={ref}
	role="group"
	aria-labelledby={labelId}
	data-slot="parameter-slider"
	data-disabled={disabled ? "" : undefined}
	data-modified={value === resetValue ? undefined : ""}
	class={cn(
		"group/parameter-slider flex w-full flex-col gap-2 data-disabled:opacity-50",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
