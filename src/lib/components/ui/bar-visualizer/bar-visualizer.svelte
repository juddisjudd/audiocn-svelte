<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { createBarLevels } from "#lib/audio/bar-levels.js";
	import type { BarIdle, BarLevelsOptions } from "#lib/audio/bar-levels.js";
	import { createFrameTask, createPainterClock } from "#lib/audio/frame-loop.js";
	import type { FrameSource, Orientation, VisualFrame } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	const DEFAULT_BAR_COUNT = 24;
	const DEFAULT_MIN_LEVEL = 0.08;
	const REDUCED_MOTION_INTERVAL_MS = 250;

	export interface BarVisualizerActions {
		/** Paint levels (0..1) directly. They are resampled to the bar count. */
		paint: (levels: ArrayLike<number>) => void;
	}

	export type BarVisualizerProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** A visual source; the bars follow its frequency bands. */
		source?: FrameSource<VisualFrame> | null;
		/** Levels, 0..1, for declarative use. */
		levels?: ArrayLike<number>;
		/** Number of bars. Bands are resampled to fit. Default 24. */
		barCount?: number;
		/** Where bars grow from. Default `center`. */
		align?: "center" | "start" | "end";
		/** Symmetric around the middle bar. Default false. */
		mirrored?: boolean;
		/** Resting bar size, 0..1. Default 0.08. */
		minLevel?: number;
		/** What the bars do with no signal. Default `static`. */
		idle?: BarIdle;
		/** Runs a sweep animation, for connecting or thinking states. Default false. */
		loading?: boolean;
		orientation?: Orientation;
	};

	const ALIGN_CLASS = {
		center: "items-center",
		end: "items-end",
		start: "items-start",
	} as const;

	interface BarPainterOptions extends BarLevelsOptions {
		bars: (HTMLSpanElement | null)[];
		input: () => ArrayLike<number> | null;
		root: HTMLElement | null;
		visible: { readonly current: boolean };
	}

	const noop = () => {
		// Nothing to wake before the painter starts.
	};

	/**
	 * Paints bars outside the reactive graph, with release smoothing and idle
	 * animations. Returns true while it needs another frame: static bars that
	 * have settled, or bars off screen, cost no frames until new levels wake them.
	 */
	const createBarPainter = (options: BarPainterOptions) => {
		const { bars, reducedMotion } = options;
		const barLevels = createBarLevels(options);
		const shown = new Float32Array(options.barCount).fill(-1);
		const clock = createPainterClock();
		let lastPaintMs = Number.NEGATIVE_INFINITY;
		let activeShown: boolean | null = null;

		return (frameMs: number): boolean => {
			// Hidden: sleep. Coming back into view wakes the painter.
			if (!options.visible.current) {
				return false;
			}
			const nowMs = clock(frameMs);
			if (reducedMotion && nowMs - lastPaintMs < REDUCED_MOTION_INTERVAL_MS) {
				return true;
			}
			lastPaintMs = nowMs;
			const active = barLevels.step(nowMs, options.input());
			if (active !== activeShown) {
				activeShown = active;
				options.root?.toggleAttribute("data-active", active);
			}

			for (const [index, value] of barLevels.levels.entries()) {
				if (Math.abs(value - (shown[index] ?? -1)) > 0.002) {
					shown[index] = value;
					bars[index]?.style.setProperty("--bar-level", value.toFixed(4));
				}
			}
			return !barLevels.settled;
		};
	};
</script>

<script lang="ts">
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";

	let {
		ref = $bindable(null),
		source,
		levels,
		barCount = DEFAULT_BAR_COUNT,
		align = "center",
		mirrored = false,
		minLevel = DEFAULT_MIN_LEVEL,
		idle = "static",
		loading = false,
		orientation: orientationProp,
		class: className,
		...restProps
	}: BarVisualizerProps = $props();

	const config = useAudioConfig();
	const orientation = $derived(orientationProp ?? config.orientation ?? "horizontal");
	const horizontal = $derived(orientation === "horizontal");
	const reducedMotion = useReducedMotion();
	const bars: (HTMLSpanElement | null)[] = [];
	// Its own reference, since a prop update from the parent can reset `ref`.
	let root = $state<HTMLDivElement | null>(null);
	let input: ArrayLike<number> | null = null;
	// Wakes the painter when new levels arrive. Settled bars sleep.
	let wake = noop;
	const visible = useVisibility(
		() => root,
		(isVisible) => {
			if (isVisible) {
				wake();
			}
		}
	);

	// One signal per value, so an effect re-runs only when its own value
	// changes, not whenever any prop does.
	const frameSource = $derived(source);
	const levelsInput = $derived(levels);
	const painterBarCount = $derived(barCount);
	const painterIdle = $derived(idle);
	const painterLoading = $derived(loading);
	const painterMinLevel = $derived(minLevel);
	const painterMirrored = $derived(mirrored);

	export function paint(next: ArrayLike<number>) {
		input = next;
		wake();
	}

	useFrameSource(
		() => frameSource,
		(frame) => {
			input = frame.bands;
			wake();
		}
	);

	// Clear only when levels go from set to unset, so the bars fall instead of
	// freezing, without wiping levels painted through the handle on re-runs.
	let hadLevels = false;
	$effect(() => {
		if (levelsInput) {
			input = levelsInput;
			hadLevels = true;
		} else if (hadLevels) {
			input = null;
			hadLevels = false;
		}
		wake();
	});

	$effect(() => {
		const element = root;
		const task = createFrameTask(
			createBarPainter({
				barCount: painterBarCount,
				bars,
				idle: painterIdle,
				input: () => input,
				loading: painterLoading,
				minLevel: painterMinLevel,
				mirrored: painterMirrored,
				reducedMotion: reducedMotion.current,
				root: element,
				visible,
			})
		);
		wake = task.wake;
		return () => {
			wake = noop;
			task.stop();
			if (element) {
				delete element.dataset.active;
			}
		};
	});
</script>

<div
	bind:this={ref}
	{@attach (node) => {
		root = node;
	}}
	aria-label="Audio visualizer"
	class={cn(
		"flex justify-center gap-(--bar-gap) [--bar-gap:0.1875rem] [--bar-radius:9999px] [--bar-width:0.375rem]",
		horizontal ? "h-16 w-full flex-row" : "h-full w-16 flex-col",
		ALIGN_CLASS[align],
		className
	)}
	data-loading={loading ? "" : undefined}
	data-orientation={orientation}
	data-slot="bar-visualizer"
	role="img"
	{...restProps}
>
	{#each { length: barCount }, index (index)}
		<span
			bind:this={
				() => bars[index],
				(node) => {
					bars[index] = node;
				}
			}
			class={cn(
				"rounded-(--bar-radius) bg-current",
				horizontal
					? "h-[calc(var(--bar-level)*100%)] max-w-(--bar-width) min-w-0 flex-1"
					: "max-h-(--bar-width) min-h-0 w-[calc(var(--bar-level)*100%)] flex-1"
			)}
			data-index={index}
			data-slot="bar-visualizer-bar"
			style:--bar-level={minLevel}
		></span>
	{/each}
</div>
