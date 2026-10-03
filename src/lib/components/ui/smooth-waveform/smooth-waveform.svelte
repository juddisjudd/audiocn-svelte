<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { clamp } from "#lib/audio/decibels.js";
	import { subscribeFrame } from "#lib/audio/frame-loop.js";
	import type { FrameSource, VisualFrame } from "#lib/audio/types.js";
	import { createWaveLine } from "#lib/audio/wave-line.js";
	import type { WaveLine, WaveLineMode } from "#lib/audio/wave-line.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	const DEFAULT_LINE_WIDTH = 2;
	const REDUCED_MOTION_INTERVAL_MS = 250;
	const COLOR_REFRESH_FRAMES = 30;
	/** One point every this many pixels along the line. */
	const POINT_SPACING_PX = 3;
	/** Width of the faded ends, in pixels. */
	const FADE_PX = 24;

	export type SmoothWaveformMode = WaveLineMode;

	export interface SmoothWaveformActions {
		/** Paint a frame directly. */
		paint: (frame: VisualFrame) => void;
		/** Forget the last frame, so the line falls flat. */
		clear: () => void;
	}

	export type SmoothWaveformProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		source?: FrameSource<VisualFrame> | null;
		/**
		 * `wave` draws a smooth wave shaped by the frequency bands. `scope` draws
		 * the signal itself, like an oscilloscope. Default `wave`.
		 */
		mode?: SmoothWaveformMode;
		/** Runs a pulse along the line, for connecting or thinking states. Default false. */
		loading?: boolean;
		/** Visual gain. Default 1. */
		sensitivity?: number;
		/** Line width in pixels. Default 2. */
		lineWidth?: number;
		/** Fade the left and right ends. Default true. */
		fadeEdges?: boolean;
	};

	interface Size {
		width: number;
		height: number;
		ratio: number;
	}

	const drawLine = (
		context: CanvasRenderingContext2D,
		line: WaveLine,
		size: Size,
		lineWidth: number
	) => {
		const middle = size.height / 2;
		const reach = Math.max(0, middle - lineWidth);
		context.lineWidth = lineWidth;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.beginPath();
		for (let point = 0; point < line.count; point += 1) {
			const x = (point / (line.count - 1)) * size.width;
			const y = middle - (line.heights[point] ?? 0) * reach;
			if (point === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		}
		context.stroke();
	};

	/** Cuts the ends away with a gradient, so the line fades in and out. */
	const fadeEnds = (context: CanvasRenderingContext2D, size: Size) => {
		const edge = Math.min(FADE_PX, size.width / 2);
		context.globalCompositeOperation = "destination-out";
		const left = context.createLinearGradient(0, 0, edge, 0);
		left.addColorStop(0, "rgba(0, 0, 0, 1)");
		left.addColorStop(1, "rgba(0, 0, 0, 0)");
		context.fillStyle = left;
		context.fillRect(0, 0, edge, size.height);
		const right = context.createLinearGradient(size.width - edge, 0, size.width, 0);
		right.addColorStop(0, "rgba(0, 0, 0, 0)");
		right.addColorStop(1, "rgba(0, 0, 0, 1)");
		context.fillStyle = right;
		context.fillRect(size.width - edge, 0, edge, size.height);
		context.globalCompositeOperation = "source-over";
	};
</script>

<script lang="ts">
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";

	let {
		ref = $bindable(null),
		source,
		mode = "wave",
		loading = false,
		sensitivity = 1,
		lineWidth = DEFAULT_LINE_WIDTH,
		fadeEdges = true,
		class: className,
		...restProps
	}: SmoothWaveformProps = $props();

	const reducedMotion = useReducedMotion();
	// Its own reference, since a prop update from the parent can reset `ref`.
	let root = $state<HTMLDivElement | null>(null);
	const visible = useVisibility(() => root);
	let canvas = $state<HTMLCanvasElement | null>(null);
	let latest: VisualFrame | null = null;

	// One signal per value, so the line rebuilds only when one of them changes,
	// not whenever any prop does.
	const frameSource = $derived(source);
	const lineMode = $derived(mode);
	const lineLoading = $derived(loading);
	const lineSensitivity = $derived(sensitivity);

	export function paint(frame: VisualFrame) {
		latest = frame;
	}

	export function clear() {
		latest = null;
	}

	useFrameSource(() => frameSource, paint);

	$effect(() => {
		const element = root;
		const target = canvas;
		const context = target?.getContext("2d");
		if (!(element && target && context)) {
			return;
		}
		const reduced = reducedMotion.current;
		const line = createWaveLine({
			loading: lineLoading,
			mode: lineMode,
			reducedMotion: reduced,
			sensitivity: lineSensitivity,
		});
		const size: Size = { height: 0, ratio: 1, width: 0 };
		let { color } = getComputedStyle(target);
		let framesSinceColor = 0;
		let lastPaintMs = 0;
		let active = false;

		const resize = () => {
			const rect = target.getBoundingClientRect();
			size.ratio = window.devicePixelRatio || 1;
			size.width = rect.width;
			size.height = rect.height;
			target.width = Math.max(1, Math.round(rect.width * size.ratio));
			target.height = Math.max(1, Math.round(rect.height * size.ratio));
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(target);

		const tick = (nowMs: number) => {
			if (!visible.current || size.width === 0) {
				return;
			}
			framesSinceColor += 1;
			if (framesSinceColor >= COLOR_REFRESH_FRAMES) {
				framesSinceColor = 0;
				({ color } = getComputedStyle(target));
			}
			if (reduced && nowMs - lastPaintMs < REDUCED_MOTION_INTERVAL_MS) {
				return;
			}
			lastPaintMs = nowMs;
			const count = Math.round(size.width / POINT_SPACING_PX) + 1;
			const nextActive = line.step(nowMs, latest, count);
			if (nextActive !== active) {
				active = nextActive;
				element.toggleAttribute("data-active", active);
			}
			context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
			context.clearRect(0, 0, size.width, size.height);
			context.strokeStyle = color;
			// Stroke options are read on each paint, so changing them doesn't
			// rebuild the line and snap it flat.
			drawLine(context, line, size, clamp(lineWidth, 0.5, size.height / 2));
			if (fadeEdges) {
				fadeEnds(context, size);
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
	class={cn("relative h-24 w-full [--waveform:currentColor]", className)}
	data-loading={loading ? "" : undefined}
	data-mode={mode}
	data-slot="smooth-waveform"
	role="img"
	{...restProps}
>
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		class="absolute inset-0 size-full text-(--waveform)"
		data-slot="smooth-waveform-canvas"
	></canvas>
</div>
