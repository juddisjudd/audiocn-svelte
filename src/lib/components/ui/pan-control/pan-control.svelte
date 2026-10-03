<script lang="ts" module>
	import { Slider as SliderPrimitive } from "bits-ui";
	import { tv } from "tailwind-variants";
	import type { AudioSize } from "#lib/hooks/use-audio-config.svelte.js";

	export const panControlVariants = tv({
		base: "group/pan-control relative flex w-full touch-none items-center select-none data-disabled:opacity-50",
		variants: {
			size: {
				default: "[--pan-thumb-size:0.875rem] [--pan-track-size:0.25rem]",
				lg: "[--pan-thumb-size:1rem] [--pan-track-size:0.375rem]",
				sm: "[--pan-thumb-size:0.75rem] [--pan-track-size:0.1875rem]",
			},
		},
		defaultVariants: { size: "default" },
	});

	export type PanControlProps = Omit<
		SliderPrimitive.RootProps,
		| "type"
		| "value"
		| "onValueChange"
		| "onValueCommit"
		| "min"
		| "max"
		| "step"
		| "orientation"
		| "dir"
		| "autoSort"
		| "thumbPositioning"
		| "trackPadding"
		| "child"
		| "children"
	> & {
		/** −1 (left) to 1 (right). Default 0. */
		value?: number;
		onValueChange?: (value: number) => void;
		onValueCommit?: (value: number) => void;
		/** Default 0.05. */
		step?: number;
		/** Shift+arrow and Page Up/Down. Default 0.25. */
		largeStep?: number;
		/** Snap to the centre while dragging near it. Default true. */
		detent?: boolean;
		/** Default: "L30", "C", "R30". */
		format?: (value: number) => string;
		size?: AudioSize;
	};
</script>

<script lang="ts">
	import { clamp } from "#lib/audio/decibels.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn } from "#lib/utils.js";
	import {
		describePan,
		formatPan,
		pointerPosition,
		POSITION_STEP,
		roundToStep,
		snapPosition,
	} from "./pan-control-utils.js";

	const PERCENT = 100;
	const DETENT_RANGE = 0.08;

	let {
		ref = $bindable(null),
		value = $bindable(0),
		onValueChange,
		onValueCommit,
		step = 0.05,
		largeStep = 0.25,
		detent = true,
		format = formatPan,
		size: sizeProp,
		disabled: disabledProp,
		class: className,
		onpointerdown,
		...restProps
	}: PanControlProps = $props();

	const config = useAudioConfig();
	const size = $derived(sizeProp ?? config.size ?? "default");
	const disabled = $derived(disabledProp ?? config.disabled ?? false);

	const position = $derived(clamp((value + 1) / 2, 0, 1));
	const start = $derived(Math.min(0, value));
	const end = $derived(Math.max(0, value));

	const setValue = (next: number) => {
		if (next === value) {
			return;
		}
		value = next;
		onValueChange?.(next);
	};

	const snapToCenter = (next: number) => (detent && Math.abs(next) < DETENT_RANGE ? 0 : next);

	let track = $state<HTMLElement | null>(null);
	let dragging = $state(false);

	/** The pointer driving the control: its latest event, and where it grabbed the thumb. */
	let pointer: { event: PointerEvent; offset: number; onThumb: boolean; moved: boolean } | null =
		null;

	const handleWindowMove = (event: PointerEvent) => {
		if (pointer) {
			pointer.event = event;
			pointer.moved = true;
		}
	};

	const stopTracking = () => {
		pointer = null;
		dragging = false;
		window.removeEventListener("pointermove", handleWindowMove, true);
		window.removeEventListener("pointerup", stopTracking, true);
		window.removeEventListener("pointercancel", stopTracking, true);
	};

	$effect(() => stopTracking);

	const handlePointerDown = (
		event: PointerEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) => {
		onpointerdown?.(event);
		if (event.defaultPrevented || event.button !== 0 || disabled) {
			return;
		}
		const onThumb =
			event.target instanceof Element && event.target.closest("[data-slider-thumb]") !== null;
		const at = pointerPosition(event, track);
		pointer = {
			event,
			moved: false,
			offset: onThumb && at !== null ? at - position : 0,
			onThumb,
		};
		dragging = true;
		// Capture, so the latest event is known before bits-ui reads the move.
		window.addEventListener("pointermove", handleWindowMove, true);
		window.addEventListener("pointerup", stopTracking, true);
		window.addEventListener("pointercancel", stopTracking, true);
	};

	// bits-ui reports pointer input here. Its value is on its own grid and
	// measured on the whole control, so the position is read from the track.
	const handleSlide = (next: number) => {
		if (!pointer) {
			return;
		}
		const { event, moved, offset, onThumb } = pointer;
		// Pressing the thumb grabs it where it is.
		if (onThumb && !moved) {
			return;
		}
		const at = pointerPosition(event, track);
		const fraction = at === null ? next : clamp(at - offset, 0, 1);
		const stepped = clamp(roundToStep(fraction * 2 - 1, step, -1), -1, 1);
		// The centre only catches a drag, not a press on the track.
		setValue(moved ? snapToCenter(stepped) : stepped);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (disabled) {
			return;
		}
		const increment = event.shiftKey ? largeStep : step;
		const nudge = (amount: number) => clamp(roundToStep(value + amount, step, -1), -1, 1);
		const targets: Record<string, () => number> = {
			ArrowDown: () => nudge(-increment),
			ArrowLeft: () => nudge(-increment),
			ArrowRight: () => nudge(increment),
			ArrowUp: () => nudge(increment),
			End: () => 1,
			Home: () => -1,
			PageDown: () => nudge(-largeStep),
			PageUp: () => nudge(largeStep),
		};
		const target = targets[event.key];
		if (!target) {
			return;
		}
		event.preventDefault();
		const next = target();
		if (next !== value) {
			setValue(next);
			onValueCommit?.(next);
		}
	};

	const handleDoubleClick = () => {
		if (disabled) {
			return;
		}
		setValue(0);
		onValueCommit?.(0);
	};
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value={() => snapPosition(position), handleSlide}
	type="single"
	min={0}
	max={1}
	step={POSITION_STEP}
	{disabled}
	thumbPositioning="exact"
	onValueCommit={() => onValueCommit?.(snapToCenter(value))}
	data-slot="pan-control"
	data-centered={value === 0 ? "" : undefined}
	data-dragging={dragging ? "" : undefined}
	data-size={size}
	class={cn(panControlVariants({ size }), className)}
	onpointerdown={handlePointerDown}
	{...restProps}
>
	<div
		class="relative flex h-(--pan-thumb-size) w-full items-center px-[calc(var(--pan-thumb-size)/2)] before:absolute before:inset-x-0 before:-inset-y-1.5 pointer-coarse:before:-inset-y-3"
	>
		<div
			bind:this={track}
			data-slot="pan-control-track"
			class="relative h-(--pan-track-size) w-full grow rounded-full bg-input/90"
		>
			<span
				aria-hidden="true"
				data-slot="pan-control-center"
				class="absolute top-1/2 left-1/2 h-[calc(var(--pan-track-size)*3)] w-px -translate-x-1/2 -translate-y-1/2 bg-border"
			></span>
			<div
				data-slot="pan-control-range"
				class="absolute inset-y-0 left-(--pan-range-start) w-(--pan-range-size) rounded-full bg-primary"
				style:--pan-range-size="{((end - start) / 2) * PERCENT}%"
				style:--pan-range-start="{((start + 1) / 2) * PERCENT}%"
			></div>
			<SliderPrimitive.Thumb
				index={0}
				aria-label="Pan"
				aria-valuetext={describePan(value)}
				data-slot="pan-control-thumb"
				class="block size-(--pan-thumb-size) shrink-0 rounded-full bg-background shadow-sm ring-1 ring-foreground/15 outline-hidden transition-[box-shadow] hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/40 data-dragging:ring-4 data-dragging:ring-ring/30"
				ondblclick={handleDoubleClick}
				onkeydown={handleKeyDown}
			>
				{#snippet child({ props })}
					<span
						{...props}
						aria-valuemin={-1}
						aria-valuemax={1}
						aria-valuenow={value}
						data-dragging={dragging ? "" : undefined}
						style="position: absolute; left: {position * PERCENT}%; top: 50%; translate: -50% -50%;"
					></span>
				{/snippet}
			</SliderPrimitive.Thumb>
		</div>
	</div>
	<span class="sr-only">{format(value)}</span>
</SliderPrimitive.Root>
