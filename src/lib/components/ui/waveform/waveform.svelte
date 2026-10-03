<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { clamp } from "#lib/audio/decibels.js";
	import { formatTime } from "#lib/audio/time.js";
	import type { FrameSource } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	import { setWaveform, type WaveformVariant } from "./waveform-context.svelte.js";

	export type WaveformProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Peaks, 0..1, from `useWaveformData`. */
		peaks: ArrayLike<number> | null;
		/** Length in seconds. */
		duration: number;
		/** Playhead position in seconds. Bindable. Default 0. */
		currentTime?: number;
		/** A smooth playhead that never touches reactive state. */
		time?: FrameSource<number> | null;
		/** Fires while seeking. */
		onSeek?: (time: number) => void;
		/** Fires when the pointer is released or after keyboard seeking. */
		onSeekCommit?: (time: number) => void;
		/** Seconds per arrow key. Default 5. */
		step?: number;
		/** Seconds per Shift+arrow. Default 15. */
		largeStep?: number;
		/** Default `bars`. */
		variant?: WaveformVariant;
		/** Bar width in pixels. Default 2. */
		barWidth?: number;
		/** Gap in pixels. Default 1. */
		barGap?: number;
		/** Corner radius in pixels. Default 1. */
		barRadius?: number;
		/** When false, the waveform is display only. Default true. */
		interactive?: boolean;
		loading?: boolean;
		disabled?: boolean;
	};

	type DivPointerEvent = PointerEvent & { currentTarget: EventTarget & HTMLDivElement };

	const seekTarget = (
		key: string,
		current: number,
		amount: number,
		duration: number
	): number | null => {
		const targets: Record<string, number> = {
			ArrowDown: current - amount,
			ArrowLeft: current - amount,
			ArrowRight: current + amount,
			ArrowUp: current + amount,
			End: duration,
			Home: 0,
		};
		return targets[key] ?? null;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import { untrack } from "svelte";

	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";

	import WaveformCanvas from "./waveform-canvas.svelte";
	import WaveformCursor from "./waveform-cursor.svelte";

	let {
		ref = $bindable(null),
		peaks,
		duration,
		currentTime = $bindable(0),
		time,
		onSeek,
		onSeekCommit,
		step = 5,
		largeStep = 15,
		variant = "bars",
		barWidth = 2,
		barGap = 1,
		barRadius = 1,
		interactive = true,
		loading = false,
		disabled = false,
		class: className,
		children,
		...restProps
	}: WaveformProps = $props();

	// Its own reference, since a prop update from the parent can reset `ref`.
	let root = $state<HTMLDivElement | null>(null);
	const progress = { current: 0 };
	let hover = $state<number | null>(null);
	let dragging = $state(false);
	let latestTime = untrack(() => currentTime);

	const timeToPosition = (value: number) => (duration > 0 ? clamp(value / duration, 0, 1) : 0);

	const writeProgress = (value: number) => {
		latestTime = value;
		progress.current = timeToPosition(value);
		root?.style.setProperty("--waveform-position", progress.current.toFixed(5));
	};

	$effect(() => {
		writeProgress(currentTime);
	});

	const timeSource = $derived(time);
	useFrameSource(() => timeSource, writeProgress);

	const seekTo = (value: number, commit: boolean) => {
		const next = clamp(value, 0, duration);
		writeProgress(next);
		currentTime = next;
		onSeek?.(next);
		if (commit) {
			onSeekCommit?.(next);
		}
	};

	const timeAtPointer = (event: DivPointerEvent) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const position = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		return position * duration;
	};

	const active = $derived(interactive && !disabled && !loading && duration > 0);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!active) {
			return;
		}
		const next = seekTarget(event.key, latestTime, event.shiftKey ? largeStep : step, duration);
		if (next !== null) {
			event.preventDefault();
			seekTo(next, true);
		}
	};

	const handlePointerDown = (event: DivPointerEvent) => {
		if (event.button !== 0) {
			return;
		}
		event.currentTarget.setPointerCapture(event.pointerId);
		dragging = true;
		seekTo(timeAtPointer(event), false);
	};

	const handlePointerLeave = () => {
		hover = null;
	};

	const handlePointerMove = (event: DivPointerEvent) => {
		const at = timeAtPointer(event);
		hover = at;
		if (dragging) {
			seekTo(at, false);
		}
	};

	const handlePointerUp = (event: DivPointerEvent) => {
		if (!dragging) {
			return;
		}
		dragging = false;
		seekTo(timeAtPointer(event), true);
	};

	// Leaving still clears the hover, so turning interactivity off mid-hover
	// (while a track loads) doesn't leave a stale line.
	const rootProps = $derived<Partial<HTMLAttributes<HTMLDivElement>>>(
		active
			? {
					"aria-valuemax": Math.round(duration),
					"aria-valuemin": 0,
					"aria-valuenow": Math.round(currentTime),
					"aria-valuetext": `${formatTime(currentTime)} of ${formatTime(duration)}`,
					onkeydown: handleKeyDown,
					onpointerdown: handlePointerDown,
					onpointerleave: handlePointerLeave,
					onpointermove: handlePointerMove,
					onpointerup: handlePointerUp,
					role: "slider",
					tabindex: 0,
				}
			: { onpointerleave: handlePointerLeave }
	);

	setWaveform({
		get barGap() {
			return barGap;
		},
		get barRadius() {
			return barRadius;
		},
		get barWidth() {
			return barWidth;
		},
		get duration() {
			return duration;
		},
		get hover() {
			return hover;
		},
		get interactive() {
			return active;
		},
		get loading() {
			return loading;
		},
		get peaks() {
			return peaks;
		},
		progress,
		timeToPosition,
		get variant() {
			return variant;
		},
	});
</script>

<div
	bind:this={ref}
	{@attach (node) => {
		root = node;
	}}
	class={cn(
		"group/waveform relative h-20 w-full touch-none rounded-lg outline-none select-none [--waveform-cursor:var(--foreground)] [--waveform-position:0] [--waveform-progress:var(--primary)] [--waveform:var(--muted-foreground)] focus-visible:ring-3 focus-visible:ring-ring/30 data-disabled:opacity-50",
		className
	)}
	data-disabled={disabled ? "" : undefined}
	data-dragging={dragging ? "" : undefined}
	data-loading={loading ? "" : undefined}
	data-slot="waveform"
	data-variant={variant}
	{...mergeProps(rootProps, restProps)}
>
	{#if children}
		{@render children()}
	{:else}
		<WaveformCanvas />
		<WaveformCursor />
	{/if}
</div>
