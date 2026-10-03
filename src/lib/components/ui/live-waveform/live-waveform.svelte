<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { resampleLevels } from "#lib/audio/bands.js";
	import { clamp } from "#lib/audio/decibels.js";
	import { createFrameTask } from "#lib/audio/frame-loop.js";
	import { createHistoryPlayback } from "#lib/audio/history-playback.js";
	import type { FrameSource, VisualFrame } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	const COLOR_REFRESH_FRAMES = 30;
	const REDUCED_MOTION_INTERVAL_MS = 250;
	const IDLE_ALPHA = 0.35;

	const noop = () => {
		// Nothing to wake before the painter starts.
	};

	/**
	 * Calls `onChange` when the page theme may have changed the canvas colour: a
	 * class, style or data-theme change on the root element, or the system colour
	 * scheme. A sleeping painter would otherwise keep the old colour.
	 */
	const observeTheme = (onChange: () => void) => {
		const stops: (() => void)[] = [];
		if (typeof MutationObserver !== "undefined") {
			const observer = new MutationObserver(onChange);
			observer.observe(document.documentElement, {
				attributeFilter: ["class", "style", "data-theme"],
				attributes: true,
			});
			stops.push(() => {
				observer.disconnect();
			});
		}
		if (typeof window.matchMedia === "function") {
			const media = window.matchMedia("(prefers-color-scheme: dark)");
			media.addEventListener("change", onChange);
			stops.push(() => {
				media.removeEventListener("change", onChange);
			});
		}
		return () => {
			for (const stop of stops) {
				stop();
			}
		};
	};

	export interface LiveWaveformActions {
		/** Paint a frame directly. */
		paint: (frame: VisualFrame) => void;
		/** Clear the canvas and forget the last frame. */
		clear: () => void;
	}

	export type LiveWaveformMode = "scrolling" | "static";
	export type LiveWaveformVariant = "bars" | "line" | "mirror";

	export type LiveWaveformProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		source?: FrameSource<VisualFrame> | null;
		/** `scrolling` shows the level history; `static` shows the current frame. Default `static`. */
		mode?: LiveWaveformMode;
		/** Default `bars`. `line` draws the waveform trace. */
		variant?: LiveWaveformVariant;
		/** Bar width in pixels. Default 3. */
		barWidth?: number;
		/** Gap between bars in pixels. Default 1. */
		barGap?: number;
		/** Bar corner radius in pixels. Default 1.5. */
		barRadius?: number;
		/** Smallest bar height in pixels. Default 4. */
		minBarHeight?: number;
		/** Line width for the `line` variant. Default 1.5. */
		lineWidth?: number;
		/** Fade the left and right edges. Default true. */
		fadeEdges?: boolean;
		/** Width of the fade in pixels. Default 24. */
		fadeWidth?: number;
		/** When false, shows an idle dotted line. Default true. */
		active?: boolean;
		/** Visual gain. Default 1. */
		sensitivity?: number;
	};

	interface Size {
		width: number;
		height: number;
		ratio: number;
	}

	interface DrawOptions {
		mode: LiveWaveformMode;
		variant: LiveWaveformVariant;
		barWidth: number;
		barGap: number;
		barRadius: number;
		minBarHeight: number;
		lineWidth: number;
		fadeEdges: boolean;
		fadeWidth: number;
		active: boolean;
		sensitivity: number;
	}

	const drawBar = (
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		radius: number
	) => {
		if (typeof context.roundRect === "function") {
			context.beginPath();
			context.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
			context.fill();
		} else {
			context.fillRect(x, y, width, height);
		}
	};

	const historyLevels = (frame: VisualFrame, count: number) => {
		const available = Math.min(frame.historyLength, count);
		const size = frame.history.length;
		const includePrevious =
			available === size && available < count && frame.historyPreviousLevel !== undefined;
		const offset = includePrevious ? 1 : 0;
		const out = new Float32Array(available + offset);
		if (includePrevious) {
			out[0] = frame.historyPreviousLevel ?? 0;
		}
		const first = frame.historyStart + frame.historyLength - available;
		for (let index = 0; index < available; index += 1) {
			out[index + offset] = frame.history[(first + index) % size] ?? 0;
		}
		return out;
	};

	const levelsFor = (frame: VisualFrame, count: number, options: DrawOptions): Float32Array => {
		if (options.mode === "scrolling") {
			return historyLevels(frame, count + 1);
		}
		if (options.variant !== "mirror") {
			return resampleLevels(frame.bands, 0, frame.bands.length, new Float32Array(count));
		}
		const half = resampleLevels(
			frame.bands,
			0,
			frame.bands.length,
			new Float32Array(Math.ceil(count / 2))
		);
		const out = new Float32Array(count);
		const center = (count - 1) / 2;
		for (let index = 0; index < count; index += 1) {
			out[index] = half[Math.min(half.length - 1, Math.floor(Math.abs(index - center)))] ?? 0;
		}
		return out;
	};

	const drawIdle = (context: CanvasRenderingContext2D, size: Size, options: DrawOptions) => {
		const step = (options.barWidth + options.barGap) * 2;
		const y = size.height / 2 - 0.5;
		context.globalAlpha = IDLE_ALPHA;
		for (let x = 0; x < size.width; x += step) {
			context.fillRect(x, y, options.barWidth, 1);
		}
		context.globalAlpha = 1;
	};

	const drawLine = (
		context: CanvasRenderingContext2D,
		size: Size,
		frame: VisualFrame,
		options: DrawOptions,
		scrollProgress: number
	) => {
		const middle = size.height / 2;
		context.lineWidth = options.lineWidth;
		context.lineJoin = "round";
		context.beginPath();

		if (options.mode === "static" && frame.timeDomain && frame.timeDomain.length > 1) {
			const samples = frame.timeDomain;
			for (let index = 0; index < samples.length; index += 1) {
				const x = (index / (samples.length - 1)) * size.width;
				const value = clamp((samples[index] ?? 0) * options.sensitivity, -1, 1);
				const y = middle - value * (middle - options.lineWidth);
				if (index === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.stroke();
			return;
		}

		const count = Math.max(2, Math.floor(size.width / (options.barWidth + options.barGap)));
		const levels = levelsFor(frame, count, { ...options, variant: "bars" });
		const offset = count - levels.length + 1 - scrollProgress;
		for (let index = 0; index < levels.length; index += 1) {
			const x = ((offset + index) / (count - 1)) * size.width;
			const value = clamp((levels[index] ?? 0) * options.sensitivity, 0, 1);
			const y = middle - value * (middle - options.lineWidth);
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		}
		for (let index = levels.length - 1; index >= 0; index -= 1) {
			const x = ((offset + index) / (count - 1)) * size.width;
			const value = clamp((levels[index] ?? 0) * options.sensitivity, 0, 1);
			context.lineTo(x, middle + value * (middle - options.lineWidth));
		}
		context.closePath();
		context.globalAlpha = 0.25;
		context.fill();
		context.globalAlpha = 1;
		context.stroke();
	};

	const drawLevelBar = (
		context: CanvasRenderingContext2D,
		size: Size,
		options: DrawOptions,
		x: number,
		level: number
	) => {
		const value = clamp(level * options.sensitivity, 0, 1);
		const height = Math.max(options.minBarHeight, value * size.height);
		const y = (size.height - height) / 2;
		context.globalAlpha = 0.4 + 0.6 * value;
		drawBar(context, x, y, options.barWidth, height, options.barRadius);
	};

	const drawScrollingMirror = (
		context: CanvasRenderingContext2D,
		size: Size,
		frame: VisualFrame,
		options: DrawOptions,
		scrollProgress: number,
		count: number
	) => {
		const levels = historyLevels(frame, Math.ceil(count / 2) + 1);
		const center = (size.width - options.barWidth) / 2;
		const pitch = options.barWidth + options.barGap;
		context.save();
		context.beginPath();
		context.rect(0, 0, center, size.height);
		context.rect(center + options.barWidth, 0, center, size.height);
		context.clip();
		for (let age = levels.length - 1; age > 0; age -= 1) {
			const value = levels[levels.length - 1 - age] ?? 0;
			const distance = (age - 1 + scrollProgress) * pitch;
			drawLevelBar(context, size, options, center - distance, value);
			drawLevelBar(context, size, options, center + distance, value);
		}
		context.restore();
		if (levels.length > 0) {
			const newest = levels.at(-1) ?? 0;
			const previous = levels.at(-2) ?? newest;
			drawLevelBar(context, size, options, center, previous + (newest - previous) * scrollProgress);
		}
	};

	const drawBars = (
		context: CanvasRenderingContext2D,
		size: Size,
		frame: VisualFrame,
		options: DrawOptions,
		scrollProgress: number
	) => {
		const pitch = options.barWidth + options.barGap;
		const count = Math.max(1, Math.floor((size.width + options.barGap) / pitch));
		if (options.mode === "scrolling" && options.variant === "mirror") {
			drawScrollingMirror(context, size, frame, options, scrollProgress, count);
		} else {
			const levels = levelsFor(frame, count, options);
			const offset = count - levels.length + 1 - scrollProgress;
			const used = count * pitch - options.barGap;
			const left = (size.width - used) / 2;
			for (let index = 0; index < levels.length; index += 1) {
				const x = left + (offset + index) * pitch;
				drawLevelBar(context, size, options, x, levels[index] ?? 0);
			}
		}
		context.globalAlpha = 1;
	};

	const fade = (context: CanvasRenderingContext2D, size: Size, width: number) => {
		const edge = Math.min(width, size.width / 2);
		context.globalCompositeOperation = "destination-out";
		const leftGradient = context.createLinearGradient(0, 0, edge, 0);
		leftGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
		leftGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
		context.fillStyle = leftGradient;
		context.fillRect(0, 0, edge, size.height);
		const rightGradient = context.createLinearGradient(size.width - edge, 0, size.width, 0);
		rightGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
		rightGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
		context.fillStyle = rightGradient;
		context.fillRect(size.width - edge, 0, edge, size.height);
		context.globalCompositeOperation = "source-over";
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";

	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";

	let {
		ref = $bindable(null),
		source,
		mode = "static",
		variant = "bars",
		barWidth = 3,
		barGap = 1,
		barRadius = 1.5,
		minBarHeight = 4,
		lineWidth = 1.5,
		fadeEdges = true,
		fadeWidth = 24,
		active = true,
		sensitivity = 1,
		class: className,
		...restProps
	}: LiveWaveformProps = $props();

	const reducedMotion = useReducedMotion();
	let canvas = $state<HTMLCanvasElement | null>(null);
	// Wakes the painter when there is something new to draw. A drawn canvas
	// sleeps until then.
	let wake = noop;
	const visible = useVisibility(
		() => canvas,
		(isVisible) => {
			if (isVisible) {
				wake();
			}
		}
	);
	let latest: VisualFrame | null = null;
	let dirty = true;
	const historyPlayback = createHistoryPlayback();
	// One signal per value, so an effect re-runs only when its own value
	// changes, not whenever any prop does.
	const frameSource = $derived(source);
	const drawActive = $derived(active);
	const drawBarGap = $derived(barGap);
	const drawBarRadius = $derived(barRadius);
	const drawBarWidth = $derived(barWidth);
	const drawFadeEdges = $derived(fadeEdges);
	const drawFadeWidth = $derived(fadeWidth);
	const drawLineWidth = $derived(lineWidth);
	const drawMinBarHeight = $derived(minBarHeight);
	const drawMode = $derived(mode);
	const drawSensitivity = $derived(sensitivity);
	const drawVariant = $derived(variant);
	let previousSource = untrack(() => frameSource);

	$effect(() => {
		const current = frameSource;
		if (previousSource !== current) {
			historyPlayback.clear();
			latest = null;
			dirty = true;
			previousSource = current;
			wake();
		}
	});

	export function paint(frame: VisualFrame) {
		latest = frame;
		dirty = true;
		wake();
	}

	export function clear() {
		historyPlayback.clear();
		latest = null;
		dirty = true;
		wake();
	}

	useFrameSource(() => frameSource, paint);

	$effect(() => {
		const element = canvas;
		const context = element?.getContext("2d");
		if (!(element && context)) {
			return;
		}
		const reduced = reducedMotion.current;
		const options: DrawOptions = {
			active: drawActive,
			barGap: drawBarGap,
			barRadius: drawBarRadius,
			barWidth: drawBarWidth,
			fadeEdges: drawFadeEdges,
			fadeWidth: drawFadeWidth,
			lineWidth: drawLineWidth,
			minBarHeight: drawMinBarHeight,
			mode: drawMode,
			sensitivity: drawSensitivity,
			variant: drawVariant,
		};
		const size: Size = { height: 0, ratio: 1, width: 0 };
		let color = "";
		let framesSinceColor = COLOR_REFRESH_FRAMES;
		let lastPaintMs = 0;
		let wakeTask = noop;
		let lastScrollProgress = 1;
		dirty = true;

		const resize = () => {
			const rect = element.getBoundingClientRect();
			size.ratio = window.devicePixelRatio || 1;
			size.width = rect.width;
			size.height = rect.height;
			element.width = Math.max(1, Math.round(rect.width * size.ratio));
			element.height = Math.max(1, Math.round(rect.height * size.ratio));
			framesSinceColor = COLOR_REFRESH_FRAMES;
			dirty = true;
			wakeTask();
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(element);

		const tick = (nowMs: number): boolean => {
			framesSinceColor += 1;
			if (framesSinceColor >= COLOR_REFRESH_FRAMES) {
				framesSinceColor = 0;
				const next = getComputedStyle(element).color;
				if (next !== color) {
					color = next;
					dirty = true;
				}
			}
			let frame = latest;
			let scrollProgress = 1;
			if (frame && options.active && options.mode === "scrolling" && !reduced) {
				({ frame, progress: scrollProgress } = historyPlayback.read(frame, nowMs));
			} else {
				historyPlayback.clear();
			}
			if (scrollProgress !== lastScrollProgress) {
				dirty = true;
			}
			// Off screen it stays dirty, so it repaints when it comes back.
			if (size.width === 0 || !visible.current) {
				return false;
			}
			if (!dirty) {
				return scrollProgress < 1;
			}
			if (reduced && nowMs - lastPaintMs < REDUCED_MOTION_INTERVAL_MS) {
				return true;
			}
			lastPaintMs = nowMs;
			lastScrollProgress = scrollProgress;
			dirty = false;

			context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
			context.clearRect(0, 0, size.width, size.height);
			context.fillStyle = color;
			context.strokeStyle = color;

			if (!(options.active && frame)) {
				drawIdle(context, size, options);
				return false;
			}
			if (options.variant === "line") {
				drawLine(context, size, frame, options, scrollProgress);
			} else {
				drawBars(context, size, frame, options, scrollProgress);
			}
			if (options.fadeEdges) {
				fade(context, size, options.fadeWidth);
			}
			return scrollProgress < 1;
		};

		const task = createFrameTask(tick);
		wakeTask = task.wake;
		wake = task.wake;
		const stopObservingTheme = observeTheme(() => {
			framesSinceColor = COLOR_REFRESH_FRAMES;
			task.wake();
		});
		return () => {
			wake = noop;
			task.stop();
			observer.disconnect();
			stopObservingTheme();
		};
	});
</script>

<div
	bind:this={ref}
	aria-label="Live waveform"
	class={cn("relative h-16 w-full [--waveform:currentColor]", className)}
	data-active={active ? "" : undefined}
	data-mode={mode}
	data-slot="live-waveform"
	data-variant={variant}
	role="img"
	{...restProps}
>
	<canvas
		bind:this={canvas}
		class="absolute inset-0 size-full text-(--waveform)"
		data-slot="live-waveform-canvas"
	></canvas>
</div>
