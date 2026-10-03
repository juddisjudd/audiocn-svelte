<script lang="ts" module>
	import { Slider as SliderPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type FaderTrackProps = Omit<
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
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";
	import {
		pointerPosition,
		POSITION_STEP,
		snapPosition,
		useFader,
		type FaderChangeReason,
	} from "./fader-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		onpointerdown,
		...restProps
	}: FaderTrackProps = $props();

	const fader = useFader("FaderTrack");
	const horizontal = $derived(fader.orientation === "horizontal");

	let track = $state<HTMLElement | null>(null);

	/** The pointer driving the fader: its latest event, and where it grabbed the thumb. */
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
		fader.setDragging(false);
		window.removeEventListener("pointermove", handleWindowMove, true);
		window.removeEventListener("pointerup", stopTracking, true);
		window.removeEventListener("pointercancel", stopTracking, true);
	};

	$effect(() => stopTracking);

	const handlePointerDown = (
		event: PointerEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) => {
		onpointerdown?.(event);
		if (event.defaultPrevented || event.button !== 0 || fader.disabled) {
			return;
		}
		const onThumb =
			event.target instanceof Element && event.target.closest("[data-slider-thumb]") !== null;
		const at = pointerPosition(event, track, fader.orientation);
		pointer = {
			event,
			moved: false,
			offset: onThumb && at !== null ? at - fader.position : 0,
			onThumb,
		};
		fader.setDragging(true);
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
		const at = pointerPosition(event, track, fader.orientation);
		const position = at === null ? next : Math.min(1, Math.max(0, at - offset));
		const reason: FaderChangeReason = moved ? "drag" : "track-press";
		fader.change(fader.fromPosition(position, event.altKey), { event, reason });
	};
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value={() => snapPosition(fader.position), handleSlide}
	type="single"
	min={0}
	max={1}
	step={POSITION_STEP}
	orientation={fader.orientation}
	disabled={fader.disabled}
	thumbPositioning="exact"
	onValueCommit={() => fader.commit(fader.value)}
	data-slot="fader-control"
	class={cn(
		"relative flex min-h-0 min-w-0 items-center",
		horizontal
			? "h-(--fader-thumb-size) w-full px-[calc(var(--fader-thumb-size)/2)] before:absolute before:inset-x-0 before:-inset-y-1.5 pointer-coarse:before:-inset-y-3"
			: "h-full w-(--fader-thumb-size) flex-col py-[calc(var(--fader-thumb-size)/2)] before:absolute before:-inset-x-1.5 before:inset-y-0 pointer-coarse:before:-inset-x-3"
	)}
	onpointerdown={handlePointerDown}
	{...restProps}
>
	<div
		bind:this={track}
		data-slot="fader-track"
		class={cn(
			"relative grow rounded-full bg-input/90",
			horizontal ? "h-(--fader-track-size) w-full" : "h-full w-(--fader-track-size)",
			className
		)}
	>
		{@render children?.()}
	</div>
</SliderPrimitive.Root>
