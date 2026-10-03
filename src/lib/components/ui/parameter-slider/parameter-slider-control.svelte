<script lang="ts" module>
	import { Slider as SliderPrimitive } from "bits-ui";

	export type ParameterSliderControlProps = Omit<
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
	>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";
	import {
		pointerPosition,
		POSITION_STEP,
		snapPosition,
		useParameterSlider,
	} from "./parameter-slider-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		onpointerdown,
		...restProps
	}: ParameterSliderControlProps = $props();

	const slider = useParameterSlider("ParameterSliderControl");
	const start = $derived(Math.min(slider.originPosition, slider.position) * 100);
	const end = $derived(Math.max(slider.originPosition, slider.position) * 100);

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
		if (event.defaultPrevented || event.button !== 0 || slider.disabled) {
			return;
		}
		const onThumb =
			event.target instanceof Element && event.target.closest("[data-slider-thumb]") !== null;
		const at = pointerPosition(event, track);
		pointer = {
			event,
			moved: false,
			offset: onThumb && at !== null ? at - slider.position : 0,
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
		const position = at === null ? next : Math.min(1, Math.max(0, at - offset));
		slider.change(slider.quantize(slider.taper.toValue(position)), { event, reason: "drag" });
	};

	const handleDoubleClick = (event: MouseEvent) => {
		if (slider.disabled) {
			return;
		}
		slider.change(slider.resetValue, { event, reason: "reset" });
		slider.commit(slider.resetValue);
	};

	// Runs before bits-ui's handler, which skips any key handled here.
	const handleKeyDown = (event: KeyboardEvent) => {
		slider.handleKeyDown(event);
	};
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value={() => snapPosition(slider.position), handleSlide}
	type="single"
	min={0}
	max={1}
	step={POSITION_STEP}
	disabled={slider.disabled}
	thumbPositioning="exact"
	onValueCommit={() => slider.commit(slider.value)}
	data-slot="parameter-slider-control"
	data-dragging={dragging ? "" : undefined}
	class={cn("relative flex w-full touch-none items-center select-none", className)}
	onpointerdown={handlePointerDown}
	{...restProps}
>
	<div
		class="relative flex h-4 w-full items-center px-2 before:absolute before:inset-x-0 before:-inset-y-1.5 pointer-coarse:before:-inset-y-3"
	>
		<div
			bind:this={track}
			data-slot="parameter-slider-track"
			class="relative h-1 w-full grow rounded-full bg-input/90"
		>
			<div
				data-slot="parameter-slider-range"
				class="absolute inset-y-0 left-(--parameter-range-start) w-(--parameter-range-size) rounded-full bg-primary"
				style:--parameter-range-size="{end - start}%"
				style:--parameter-range-start="{start}%"
			></div>
			<SliderPrimitive.Thumb
				index={0}
				aria-describedby={slider.descriptionId}
				aria-labelledby={slider.labelId}
				aria-valuetext={slider.format(slider.value)}
				data-slot="parameter-slider-thumb"
				class="block size-4 shrink-0 rounded-full bg-background shadow-sm ring-1 ring-foreground/15 outline-hidden transition-[box-shadow] hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/40 data-dragging:ring-4 data-dragging:ring-ring/30"
				ondblclick={handleDoubleClick}
				onkeydown={handleKeyDown}
			>
				{#snippet child({ props })}
					<span
						{...props}
						aria-valuemin={0}
						aria-valuemax={1}
						aria-valuenow={slider.position}
						data-dragging={dragging ? "" : undefined}
						style="position: absolute; left: {slider.position *
							100}%; top: 50%; translate: -50% -50%;"
					></span>
				{/snippet}
			</SliderPrimitive.Thumb>
		</div>
	</div>
</SliderPrimitive.Root>
