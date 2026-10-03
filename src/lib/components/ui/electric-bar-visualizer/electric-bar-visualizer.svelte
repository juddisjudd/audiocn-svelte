<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { BarIdle } from "#lib/audio/bar-levels.js";
	import type { FrameSource, Orientation, VisualFrame } from "#lib/audio/types.js";
	import type { WithElementRef, WithoutChildren } from "#lib/utils.js";
	import type { ElectricBarAlign } from "./electric-bar-visualizer-utils.js";

	export interface ElectricBarVisualizerActions {
		/** Paint levels (0..1) directly. They are resampled to the bar count. */
		paint: (levels: ArrayLike<number>) => void;
	}

	export type ElectricBarVisualizerProps = WithElementRef<
		WithoutChildren<HTMLAttributes<HTMLDivElement>>,
		HTMLDivElement
	> & {
		/** A visual source; the bars follow its frequency bands. */
		source?: FrameSource<VisualFrame> | null;
		/** Levels, 0..1, for declarative use. */
		levels?: ArrayLike<number>;
		/** Number of bars. Bands are resampled to fit. Default 16. */
		barCount?: number;
		/** Where bars grow from. Default `center`. */
		align?: ElectricBarAlign;
		/** Symmetric around the middle bar. Default false. */
		mirrored?: boolean;
		/** Resting bar size, 0..1. Default 0.08. */
		minLevel?: number;
		/** What the bars do with no signal. Default `static`. */
		idle?: BarIdle;
		/** Runs an arc along the bars, for connecting or thinking states. Default false. */
		loading?: boolean;
		orientation?: Orientation;
		/** How jagged and restless the filaments are, 0..1. Default 0.6. */
		intensity?: number;
		/** Arcs jump between loud neighbouring bars. Default true. */
		arcs?: boolean;
		/** Sparks fly off the tips on sudden rises. Default true. */
		sparks?: boolean;
		/** Widest bar in pixels. Default 6. */
		barWidth?: number;
		/** Gap between bars in pixels. Default 4. */
		barGap?: number;
	};
</script>

<script lang="ts">
	import { createBarLevels } from "#lib/audio/bar-levels.js";
	import { clamp } from "#lib/audio/decibels.js";
	import { subscribeFrame } from "#lib/audio/frame-loop.js";
	import {
		ELECTRIC_CANVAS_CLASS,
		ELECTRIC_GLOW_CLASS,
		clearElectricCanvas,
		fitElectricCanvases,
		readElectricColors,
		type ElectricCanvasSize,
	} from "#lib/electric.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";
	import { cn } from "#lib/utils.js";
	import {
		COLOR_REFRESH_FRAMES,
		DEFAULT_BAR_COUNT,
		DEFAULT_BAR_GAP,
		DEFAULT_BAR_WIDTH,
		DEFAULT_INTENSITY,
		DEFAULT_MIN_LEVEL,
		REDUCED_MOTION_INTERVAL_MS,
		createElectricScene,
		layoutElectricBars,
		paintGlow,
		paintMain,
		type PaintInput,
	} from "./electric-bar-visualizer-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		source,
		levels,
		barCount = DEFAULT_BAR_COUNT,
		align = "center",
		mirrored = false,
		minLevel = DEFAULT_MIN_LEVEL,
		idle = "static",
		loading = false,
		orientation: orientationProp,
		intensity = DEFAULT_INTENSITY,
		arcs = true,
		sparks = true,
		barWidth = DEFAULT_BAR_WIDTH,
		barGap = DEFAULT_BAR_GAP,
		...restProps
	}: ElectricBarVisualizerProps = $props();

	const config = useAudioConfig();
	const orientation = $derived(orientationProp ?? config.orientation ?? "horizontal");
	const reducedMotion = useReducedMotion();
	const visible = useVisibility(() => ref);
	let glow = $state<HTMLCanvasElement | null>(null);
	let main = $state<HTMLCanvasElement | null>(null);
	let input: ArrayLike<number> | null = null;

	export function paint(next: ArrayLike<number>) {
		input = next;
	}

	useFrameSource(
		() => source,
		(frame) => {
			input = frame.bands;
		}
	);

	// Clear only when levels go from set to unset, so the bars fall instead of
	// freezing, without wiping levels painted through the handle on re-runs.
	let hadLevels = false;
	$effect(() => {
		if (levels) {
			input = levels;
			hadLevels = true;
		} else if (hadLevels) {
			input = null;
			hadLevels = false;
		}
	});

	$effect(() => {
		const root = ref;
		const mainCanvas = main;
		const glowCanvas = glow;
		const mainContext = mainCanvas?.getContext("2d");
		const glowContext = glowCanvas?.getContext("2d");
		if (!(root && mainCanvas && glowCanvas && mainContext && glowContext)) {
			return;
		}
		const still = reducedMotion.current;
		const strength = clamp(intensity, 0, 1);
		const geometry = { align, barCount, barGap, barWidth, orientation };
		const barLevels = createBarLevels({
			barCount,
			idle,
			loading,
			minLevel,
			mirrored,
			reducedMotion: still,
		});
		const scene = createElectricScene({
			arcs,
			barCount,
			intensity: strength,
			loading,
			reducedMotion: still,
			sparks,
		});
		let size: ElectricCanvasSize = {
			glowRatio: 1,
			height: 0,
			ratio: 1,
			width: 0,
		};
		let layout = layoutElectricBars(0, 0, geometry);
		let colors = readElectricColors(mainCanvas, glowCanvas);
		let framesSinceColor = 0;
		let lastPaintMs = 0;
		let active = false;

		const resize = () => {
			size = fitElectricCanvases(mainCanvas, glowCanvas);
			layout = layoutElectricBars(size.width, size.height, geometry);
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(mainCanvas);

		const tick = (nowMs: number) => {
			if (!visible.current || size.width === 0) {
				return;
			}
			framesSinceColor += 1;
			if (framesSinceColor >= COLOR_REFRESH_FRAMES) {
				framesSinceColor = 0;
				colors = readElectricColors(mainCanvas, glowCanvas);
			}
			if (still && nowMs - lastPaintMs < REDUCED_MOTION_INTERVAL_MS) {
				return;
			}
			lastPaintMs = nowMs;
			const nextActive = barLevels.step(nowMs, input);
			if (nextActive !== active) {
				active = nextActive;
				root.toggleAttribute("data-active", active);
			}
			scene.step(nowMs, barLevels.levels, layout);
			const paintInput: PaintInput = {
				colors,
				intensity: still ? 0 : strength,
				layout,
				levels: barLevels.levels,
				nowMs,
				scene,
			};
			clearElectricCanvas(glowContext, size, size.glowRatio);
			paintGlow(glowContext, paintInput);
			clearElectricCanvas(mainContext, size, size.ratio);
			paintMain(mainContext, paintInput);
		};

		const unsubscribe = subscribeFrame(tick);
		return () => {
			unsubscribe();
			observer.disconnect();
			delete root.dataset.active;
		};
	});
</script>

<div
	bind:this={ref}
	aria-label="Audio visualizer"
	role="img"
	data-slot="electric-bar-visualizer"
	data-align={align}
	data-loading={loading ? "" : undefined}
	data-orientation={orientation}
	class={cn("relative", orientation === "horizontal" ? "h-16 w-full" : "h-full w-16", className)}
	{...restProps}
>
	<canvas
		bind:this={glow}
		aria-hidden="true"
		class={ELECTRIC_GLOW_CLASS}
		data-slot="electric-bar-visualizer-glow"
	></canvas>
	<canvas
		bind:this={main}
		aria-hidden="true"
		class={ELECTRIC_CANVAS_CLASS}
		data-slot="electric-bar-visualizer-canvas"
	></canvas>
</div>
