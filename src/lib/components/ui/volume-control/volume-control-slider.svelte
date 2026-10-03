<script lang="ts" module>
	import { Slider as SliderPrimitive } from "bits-ui";

	export type VolumeControlSliderProps = Omit<
		SliderPrimitive.RootProps,
		| "type"
		| "value"
		| "onValueChange"
		| "onValueCommit"
		| "min"
		| "max"
		| "step"
		| "orientation"
		| "disabled"
		| "dir"
		| "autoSort"
		| "thumbPositioning"
		| "trackPadding"
		| "child"
		| "children"
	> & {
		/** Shift+arrow and Page Up/Down, in position. Default 10, the whole range. */
		largeStep?: number;
	};
</script>

<script lang="ts">
	import { clamp } from "#lib/audio/decibels.js";
	import { cn } from "#lib/utils.js";
	import {
		PERCENT,
		pointerPosition,
		POSITION_STEP,
		roundToStep,
		snapPosition,
		useVolumeControl,
	} from "./volume-control-utils.js";

	let {
		ref = $bindable(null),
		largeStep = 10,
		class: className,
		onpointerdown,
		...restProps
	}: VolumeControlSliderProps = $props();

	const volume = useVolumeControl("VolumeControlSlider");
	const horizontal = $derived(volume.orientation === "horizontal");
	const shown = $derived(volume.muted ? 0 : volume.position);

	/** Moves the slider to a position on the step grid, and reports whether it moved. */
	const slideTo = (position: number) => {
		const next = clamp(roundToStep(position, volume.step, 0), 0, 1);
		if (next === shown) {
			return false;
		}
		volume.setPosition(next);
		return true;
	};

	let track = $state<HTMLElement | null>(null);
	let dragging = $state(false);

	/** The pointer driving the slider: its latest event, and where it grabbed the thumb. */
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
		if (event.defaultPrevented || event.button !== 0 || volume.disabled) {
			return;
		}
		const onThumb =
			event.target instanceof Element && event.target.closest("[data-slider-thumb]") !== null;
		const at = pointerPosition(event, track, volume.orientation);
		pointer = {
			event,
			moved: false,
			offset: onThumb && at !== null ? at - shown : 0,
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
		const at = pointerPosition(event, track, volume.orientation);
		slideTo(at === null ? next : clamp(at - offset, 0, 1));
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (volume.disabled) {
			return;
		}
		const increment = event.shiftKey ? largeStep : volume.step;
		const targets: Record<string, () => number> = {
			ArrowDown: () => shown - increment,
			ArrowLeft: () => shown - increment,
			ArrowRight: () => shown + increment,
			ArrowUp: () => shown + increment,
			End: () => 1,
			Home: () => 0,
			PageDown: () => shown - largeStep,
			PageUp: () => shown + largeStep,
		};
		const target = targets[event.key];
		if (!target) {
			return;
		}
		event.preventDefault();
		if (slideTo(target())) {
			volume.commit();
		}
	};

	const rangeStyle = $derived(
		horizontal
			? `position: absolute; left: 0; width: ${shown * PERCENT}%;`
			: `position: absolute; bottom: 0; height: ${shown * PERCENT}%;`
	);

	const thumbStyle = $derived(
		horizontal
			? `position: absolute; left: ${shown * PERCENT}%; top: 50%; translate: -50% -50%;`
			: `position: absolute; bottom: ${shown * PERCENT}%; left: 50%; translate: -50% 50%;`
	);
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value={() => snapPosition(shown), handleSlide}
	type="single"
	min={0}
	max={1}
	step={POSITION_STEP}
	orientation={volume.orientation}
	disabled={volume.disabled}
	thumbPositioning="exact"
	onValueCommit={() => volume.commit()}
	data-slot="volume-control-slider"
	data-dragging={dragging ? "" : undefined}
	class={cn(
		"relative flex touch-none items-center select-none",
		horizontal ? "w-full min-w-20" : "h-24 flex-col",
		className
	)}
	onpointerdown={handlePointerDown}
	{...restProps}
>
	<div
		class={cn(
			"relative flex items-center",
			horizontal
				? "h-(--volume-thumb-size) w-full px-[calc(var(--volume-thumb-size)/2)] before:absolute before:inset-x-0 before:-inset-y-1.5 pointer-coarse:before:-inset-y-3"
				: "h-full w-(--volume-thumb-size) flex-col py-[calc(var(--volume-thumb-size)/2)] before:absolute before:-inset-x-1.5 before:inset-y-0 pointer-coarse:before:-inset-x-3"
		)}
	>
		<div
			bind:this={track}
			data-slot="volume-control-track"
			class={cn(
				"relative grow rounded-full bg-input/90",
				horizontal ? "h-(--volume-track-size) w-full" : "h-full w-(--volume-track-size)"
			)}
		>
			<div
				data-slot="volume-control-range"
				class={cn("rounded-full bg-primary", horizontal ? "h-full" : "w-full")}
				style={rangeStyle}
			></div>
			<SliderPrimitive.Thumb
				index={0}
				aria-label="Volume"
				aria-valuetext={volume.muted ? "Muted" : `${Math.round(volume.volume * PERCENT)}%`}
				data-slot="volume-control-thumb"
				class="block size-(--volume-thumb-size) shrink-0 rounded-full bg-background shadow-sm ring-1 ring-foreground/15 outline-hidden transition-[box-shadow] hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/40"
				onkeydown={handleKeyDown}
			>
				{#snippet child({ props })}
					<span
						{...props}
						aria-valuemin={0}
						aria-valuemax={1}
						aria-valuenow={shown}
						data-dragging={dragging ? "" : undefined}
						style={thumbStyle}
					></span>
				{/snippet}
			</SliderPrimitive.Thumb>
		</div>
	</div>
</SliderPrimitive.Root>
