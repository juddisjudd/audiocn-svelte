<script lang="ts" module>
	import { Slider as SliderPrimitive } from "bits-ui";

	export type AudioPlayerSeekProps = Omit<
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
		/** Seconds per arrow key. Default 5. */
		step?: number;
		/** Seconds per Shift+arrow and Page Up/Down. Default 15. */
		largeStep?: number;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";

	import { clamp } from "#lib/audio/decibels.js";
	import { formatTime } from "#lib/audio/time.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { cn } from "#lib/utils.js";

	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";
	import {
		pointerPosition,
		POSITION_STEP,
		SEEK_LARGE_STEP,
		SEEK_STEP,
		snapPosition,
	} from "./audio-player-utils.js";

	let {
		ref = $bindable(null),
		step = SEEK_STEP,
		largeStep = SEEK_LARGE_STEP,
		disabled,
		class: className,
		onpointerdown,
		...restProps
	}: AudioPlayerSeekProps = $props();

	const context = getAudioPlayerContext("AudioPlayerSeek");
	const player = $derived(context.player);
	const duration = $derived(player.duration || 0);
	const max = $derived(Math.max(duration, 0.001));
	const currentTime = $derived(player.currentTime);

	let track = $state<HTMLElement | null>(null);
	let dragValue = $state<number | null>(null);
	let dragging = $state(false);

	const positionOf = (seconds: number) => clamp(seconds, 0, max) / max;

	// The playhead moves every frame by writing to the track, never through
	// state; state follows the player's time about four times a second.
	let latestTime = untrack(() => player.currentTime);
	const initialPosition = untrack(() => positionOf(latestTime).toFixed(5));

	const paint = (seconds: number) => {
		latestTime = seconds;
		track?.style.setProperty("--audio-player-seek-position", positionOf(seconds).toFixed(5));
	};

	$effect(() => {
		const seconds = currentTime;
		// A new duration moves the playhead too.
		void max;
		untrack(() => {
			if (dragValue === null) {
				paint(seconds);
			}
		});
	});

	useFrameSource(
		() => player.time,
		(next) => {
			if (dragValue === null) {
				paint(next);
			}
		}
	);

	const value = $derived(clamp(dragValue ?? currentTime, 0, max));
	const bufferedPercent = $derived(
		duration > 0 ? clamp(player.buffered / duration, 0, 1) * 100 : 0
	);

	const slideTo = (seconds: number) => {
		dragValue = seconds;
		paint(seconds);
	};

	const commit = (seconds: number) => {
		player.seek(seconds);
		paint(seconds);
		dragValue = null;
	};

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

	const isDisabled = $derived(disabled ?? duration === 0);

	const handlePointerDown = (
		event: PointerEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) => {
		onpointerdown?.(event);
		if (event.defaultPrevented || event.button !== 0 || isDisabled) {
			return;
		}
		const onThumb =
			event.target instanceof Element && event.target.closest("[data-slider-thumb]") !== null;
		const at = pointerPosition(event, track);
		pointer = {
			event,
			moved: false,
			offset: onThumb && at !== null ? at - positionOf(latestTime) : 0,
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
		slideTo((at === null ? next : clamp(at - offset, 0, 1)) * max);
	};

	const handleCommit = () => {
		if (dragValue !== null) {
			commit(dragValue);
		}
	};

	// Runs before bits-ui's handler, which skips any key handled here.
	const handleKeyDown = (event: KeyboardEvent) => {
		if (isDisabled) {
			return;
		}
		const amount = event.shiftKey ? largeStep : step;
		const targets: Record<string, () => number> = {
			ArrowDown: () => latestTime - amount,
			ArrowLeft: () => latestTime - amount,
			ArrowRight: () => latestTime + amount,
			ArrowUp: () => latestTime + amount,
			End: () => max,
			Home: () => 0,
			PageDown: () => latestTime - largeStep,
			PageUp: () => latestTime + largeStep,
		};
		const target = targets[event.key];
		if (!target) {
			return;
		}
		event.preventDefault();
		commit(clamp(target(), 0, max));
	};

	const thumbStyle =
		"position: absolute; left: calc(var(--audio-player-seek-position) * 100%); top: 50%; translate: -50% -50%;";
	const rangeStyle =
		"position: absolute; inset-block: 0; left: 0; width: calc(var(--audio-player-seek-position) * 100%);";
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value={() => snapPosition(positionOf(value)), handleSlide}
	type="single"
	min={0}
	max={1}
	step={POSITION_STEP}
	disabled={isDisabled}
	thumbPositioning="exact"
	onValueCommit={handleCommit}
	data-slot="audio-player-seek"
	data-dragging={dragging ? "" : undefined}
	class={cn("relative flex min-w-24 flex-1 touch-none items-center select-none", className)}
	onpointerdown={handlePointerDown}
	{...restProps}
>
	<div
		class="relative flex h-4 w-full items-center px-1.5 before:absolute before:inset-x-0 before:-inset-y-1.5 pointer-coarse:before:-inset-y-3"
	>
		<div
			bind:this={track}
			class="relative h-1 w-full grow rounded-full bg-input/90"
			data-slot="audio-player-seek-track"
			style:--audio-player-seek-position={initialPosition}
		>
			<div
				class="absolute inset-y-0 left-0 w-(--buffered) rounded-full bg-muted-foreground/25"
				data-slot="audio-player-seek-buffered"
				style:--buffered="{bufferedPercent}%"
			></div>
			<div
				class="rounded-full bg-primary"
				data-slot="audio-player-seek-range"
				style={rangeStyle}
			></div>
			<SliderPrimitive.Thumb
				index={0}
				aria-label="Seek"
				aria-valuetext="{formatTime(value)} of {formatTime(duration)}"
				class="block size-3 shrink-0 rounded-full bg-background shadow-sm ring-1 ring-foreground/15 outline-hidden transition-[box-shadow] hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/40"
				data-slot="audio-player-seek-thumb"
				onkeydown={handleKeyDown}
			>
				{#snippet child({ props })}
					<span
						{...props}
						aria-valuemin={0}
						aria-valuemax={max}
						aria-valuenow={value}
						data-dragging={dragging ? "" : undefined}
						style={thumbStyle}
					></span>
				{/snippet}
			</SliderPrimitive.Thumb>
		</div>
	</div>
</SliderPrimitive.Root>
