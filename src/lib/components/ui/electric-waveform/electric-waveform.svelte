<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { FrameSource, VisualFrame } from "#lib/audio/types.js";
	import type { WithElementRef, WithoutChildren } from "#lib/utils.js";
	import type { ElectricWaveformMode } from "./electric-waveform-utils.js";

	export interface ElectricWaveformActions {
		/** Paint a frame directly. */
		paint: (frame: VisualFrame) => void;
		/** Forget the last frame, so the line falls flat. */
		clear: () => void;
	}

	export type ElectricWaveformProps = WithElementRef<
		WithoutChildren<HTMLAttributes<HTMLDivElement>>,
		HTMLDivElement
	> & {
		source?: FrameSource<VisualFrame> | null;
		/**
		 * `wave` draws a smooth wave shaped by the frequency bands. `scope` draws
		 * the signal itself, like an oscilloscope. Default `wave`.
		 */
		mode?: ElectricWaveformMode;
		/** Runs a pulse along the line, for connecting or thinking states. Default false. */
		loading?: boolean;
		/** How jagged and restless the line is, 0..1. Default 0.6. */
		intensity?: number;
		/** Forks of lightning branch off the peaks. Default true. */
		arcs?: boolean;
		/** Sparks fly off the peaks on sudden rises. Default true. */
		sparks?: boolean;
		/** Visual gain. Default 1. */
		sensitivity?: number;
		/** Line width in pixels. Default 3. */
		lineWidth?: number;
		/** Fade the left and right ends. Default true. */
		fadeEdges?: boolean;
	};
</script>

<script lang="ts">
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
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";
	import { cn } from "#lib/utils.js";
	import {
		COLOR_REFRESH_FRAMES,
		DEFAULT_INTENSITY,
		DEFAULT_LINE_WIDTH,
		REDUCED_MOTION_INTERVAL_MS,
		createElectricTrace,
		fadeEnds,
		paintGlow,
		paintMain,
		type ElectricTraceGeometry,
		type PaintInput,
	} from "./electric-waveform-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		source,
		mode = "wave",
		loading = false,
		intensity = DEFAULT_INTENSITY,
		arcs = true,
		sparks = true,
		sensitivity = 1,
		lineWidth = DEFAULT_LINE_WIDTH,
		fadeEdges = true,
		...restProps
	}: ElectricWaveformProps = $props();

	const reducedMotion = useReducedMotion();
	// Its own reference, since a prop update from the parent can reset `ref`.
	let root = $state<HTMLDivElement | null>(null);
	const visible = useVisibility(() => root);
	let glow = $state<HTMLCanvasElement | null>(null);
	let main = $state<HTMLCanvasElement | null>(null);
	let latest: VisualFrame | null = null;

	// One signal per value, so the trace rebuilds only when one of them changes,
	// not whenever any prop does.
	const traceArcs = $derived(arcs);
	const traceIntensity = $derived(intensity);
	const traceLoading = $derived(loading);
	const traceMode = $derived(mode);
	const traceSensitivity = $derived(sensitivity);
	const traceSparks = $derived(sparks);

	export function paint(frame: VisualFrame) {
		latest = frame;
	}

	export function clear() {
		latest = null;
	}

	useFrameSource(() => source, paint);

	$effect(() => {
		const element = root;
		const mainCanvas = main;
		const glowCanvas = glow;
		const mainContext = mainCanvas?.getContext("2d");
		const glowContext = glowCanvas?.getContext("2d");
		if (!(element && mainCanvas && glowCanvas && mainContext && glowContext)) {
			return;
		}
		const still = reducedMotion.current;
		const strength = clamp(traceIntensity, 0, 1);
		const trace = createElectricTrace({
			arcs: traceArcs,
			intensity: strength,
			loading: traceLoading,
			mode: traceMode,
			reducedMotion: still,
			sensitivity: traceSensitivity,
			sparks: traceSparks,
		});
		let size: ElectricCanvasSize = {
			glowRatio: 1,
			height: 0,
			ratio: 1,
			width: 0,
		};
		let colors = readElectricColors(mainCanvas, glowCanvas);
		let framesSinceColor = 0;
		let lastPaintMs = 0;
		let active = false;

		const resize = () => {
			size = fitElectricCanvases(mainCanvas, glowCanvas);
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
			// Stroke options are read each paint, outside the effect, so changing
			// them doesn't rebuild the trace and reset its sparks, forks and loudness.
			const geometry: ElectricTraceGeometry = {
				height: size.height,
				lineWidth,
				width: size.width,
			};
			const nextActive = trace.step(nowMs, latest, geometry);
			if (nextActive !== active) {
				active = nextActive;
				element.toggleAttribute("data-active", active);
			}
			const input: PaintInput = {
				colors,
				geometry,
				intensity: still ? 0 : strength,
				nowMs,
				trace,
			};
			clearElectricCanvas(glowContext, size, size.glowRatio);
			paintGlow(glowContext, input);
			clearElectricCanvas(mainContext, size, size.ratio);
			paintMain(mainContext, input);
			if (fadeEdges) {
				fadeEnds(glowContext, geometry);
				fadeEnds(mainContext, geometry);
			}
		};

		const unsubscribe = subscribeFrame(tick);
		return () => {
			unsubscribe();
			observer.disconnect();
			delete element.dataset.active;
		};
	});
</script>

<div
	bind:this={ref}
	{@attach (node) => {
		root = node;
	}}
	aria-label="Audio waveform"
	role="img"
	data-slot="electric-waveform"
	data-loading={loading ? "" : undefined}
	data-mode={mode}
	class={cn("relative h-24 w-full", className)}
	{...restProps}
>
	<canvas
		bind:this={glow}
		aria-hidden="true"
		class={ELECTRIC_GLOW_CLASS}
		data-slot="electric-waveform-glow"
	></canvas>
	<canvas
		bind:this={main}
		aria-hidden="true"
		class={ELECTRIC_CANVAS_CLASS}
		data-slot="electric-waveform-canvas"
	></canvas>
</div>
