<script lang="ts" module>
	import type { HTMLCanvasAttributes } from "svelte/elements";

	import { clamp } from "#lib/audio/decibels.js";
	import { subscribeFrame } from "#lib/audio/frame-loop.js";
	import type { Taper } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	import {
		DEFAULT_FREQUENCY_TICKS,
		useSpectrum,
		type SpectrumVariant,
	} from "./spectrum-context.svelte.js";

	const COLOR_REFRESH_FRAMES = 30;
	const PEAK_RELEASE_PER_FRAME = 0.985;
	/** The frame length PEAK_RELEASE_PER_FRAME is tuned for. */
	const FRAME_MS = 1000 / 60;
	const REDUCED_MOTION_INTERVAL_MS = 250;

	export type SpectrumCanvasProps = WithElementRef<HTMLCanvasAttributes, HTMLCanvasElement>;

	interface Settings {
		minDb: number;
		maxDb: number;
		minHz: number;
		maxHz: number;
		frequencyTaper: Taper;
		variant: SpectrumVariant;
		peakHold: boolean;
		grid: boolean;
	}

	interface Size {
		width: number;
		height: number;
		ratio: number;
	}

	interface Colors {
		grid: string;
		line: string;
		peak: string;
	}

	const readColors = (canvas: HTMLCanvasElement): Colors => {
		const style = getComputedStyle(canvas);
		return {
			grid: style.getPropertyValue("--spectrum-grid").trim() || style.color,
			line: style.getPropertyValue("--spectrum").trim() || style.color,
			peak: style.getPropertyValue("--spectrum-peak").trim() || style.color,
		};
	};

	const drawGrid = (
		context: CanvasRenderingContext2D,
		size: Size,
		settings: Settings,
		color: string
	) => {
		const { frequencyTaper, maxDb, maxHz, minDb, minHz } = settings;
		const span = maxDb - minDb;
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.beginPath();
		for (const db of [maxDb, maxDb - span / 3, maxDb - (span * 2) / 3]) {
			const y = Math.round((1 - (db - minDb) / span) * size.height) + 0.5;
			context.moveTo(0, y);
			context.lineTo(size.width, y);
		}
		for (const hz of DEFAULT_FREQUENCY_TICKS) {
			if (hz > minHz && hz < maxHz) {
				const x = Math.round(frequencyTaper.toPosition(hz) * size.width) + 0.5;
				context.moveTo(x, 0);
				context.lineTo(x, size.height);
			}
		}
		context.stroke();
	};

	const drawBars = (context: CanvasRenderingContext2D, size: Size, bands: Float32Array) => {
		const slot = size.width / bands.length;
		const gap = Math.min(2, slot * 0.25);
		for (const [index, band] of bands.entries()) {
			const barHeight = clamp(band, 0, 1) * size.height;
			context.fillRect(
				index * slot + gap / 2,
				size.height - barHeight,
				Math.max(1, slot - gap),
				barHeight
			);
		}
	};

	const drawCurve = (
		context: CanvasRenderingContext2D,
		size: Size,
		bands: Float32Array,
		filled: boolean
	) => {
		const slot = size.width / bands.length;
		context.lineWidth = 1.5;
		context.lineJoin = "round";
		context.beginPath();
		for (const [index, band] of bands.entries()) {
			const x = (index + 0.5) * slot;
			const y = size.height - clamp(band, 0, 1) * size.height;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		}
		if (filled) {
			context.lineTo((bands.length - 0.5) * slot, size.height);
			context.lineTo(0.5 * slot, size.height);
			context.closePath();
			context.globalAlpha = 0.3;
			context.fill();
			context.globalAlpha = 1;
		}
		context.stroke();
	};

	/** Draws held peaks and reports whether any are still falling. */
	const drawPeaks = (
		context: CanvasRenderingContext2D,
		size: Size,
		bands: Float32Array,
		peaks: Float32Array,
		release: number
	) => {
		const slot = size.width / bands.length;
		let falling = false;
		for (const [index, band] of bands.entries()) {
			const level = clamp(band, 0, 1);
			const held = Math.max(level, (peaks[index] ?? 0) * release);
			peaks[index] = held;
			if (held > level + 0.001) {
				falling = true;
			}
			context.fillRect(
				index * slot,
				size.height - held * size.height - 1,
				Math.max(1, slot - 1),
				2
			);
		}
		return falling;
	};
</script>

<script lang="ts">
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";

	let { ref = $bindable(null), class: className, ...restProps }: SpectrumCanvasProps = $props();

	const spectrum = useSpectrum("SpectrumCanvas");
	const reducedMotion = useReducedMotion();
	// Its own reference, since a prop update from the parent can reset `ref`.
	let canvas = $state<HTMLCanvasElement | null>(null);
	const visible = useVisibility(() => canvas);

	$effect(() => {
		const element = canvas;
		const context = element?.getContext("2d");
		if (!(element && context)) {
			return;
		}
		const settings: Settings = {
			frequencyTaper: spectrum.frequencyTaper,
			grid: spectrum.grid,
			maxDb: spectrum.maxDb,
			maxHz: spectrum.maxHz,
			minDb: spectrum.minDb,
			minHz: spectrum.minHz,
			peakHold: spectrum.peakHold,
			variant: spectrum.variant,
		};
		const { latest } = spectrum;
		const reduced = reducedMotion.current;
		const size: Size = { height: 0, ratio: 1, width: 0 };
		let colors = readColors(element);
		let framesSinceColor = 0;
		let peaks = new Float32Array(0);
		let lastPaintMs = 0;
		// Each canvas keeps its own state, so two in one Spectrum both paint.
		let dirty = true;
		let paintedVersion = -1;

		const resize = () => {
			const rect = element.getBoundingClientRect();
			size.ratio = window.devicePixelRatio || 1;
			size.width = rect.width;
			size.height = rect.height;
			element.width = Math.max(1, Math.round(rect.width * size.ratio));
			element.height = Math.max(1, Math.round(rect.height * size.ratio));
			dirty = true;
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(element);

		const shouldPaint = (nowMs: number) => {
			framesSinceColor += 1;
			if (framesSinceColor >= COLOR_REFRESH_FRAMES) {
				framesSinceColor = 0;
				const next = readColors(element);
				if (next.grid !== colors.grid || next.line !== colors.line || next.peak !== colors.peak) {
					colors = next;
					dirty = true;
				}
			}
			const stale = dirty || latest.version !== paintedVersion;
			if (!stale || size.width === 0 || !visible.current) {
				return false;
			}
			return !reduced || nowMs - lastPaintMs >= REDUCED_MOTION_INTERVAL_MS;
		};

		const draw = (nowMs: number) => {
			if (!shouldPaint(nowMs)) {
				return;
			}
			const elapsedMs = lastPaintMs === 0 ? 0 : nowMs - lastPaintMs;
			lastPaintMs = nowMs;
			dirty = false;
			paintedVersion = latest.version;
			context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
			context.clearRect(0, 0, size.width, size.height);
			if (settings.grid) {
				drawGrid(context, size, settings, colors.grid);
			}
			const bands = latest.frame?.bands;
			if (!bands || bands.length === 0) {
				return;
			}
			context.fillStyle = colors.line;
			context.strokeStyle = colors.line;
			if (settings.variant === "bars") {
				drawBars(context, size, bands);
			} else {
				drawCurve(context, size, bands, settings.variant === "area");
			}
			if (settings.peakHold) {
				if (peaks.length !== bands.length) {
					peaks = new Float32Array(bands.length);
				}
				context.fillStyle = colors.peak;
				// Decay by elapsed time, not per paint, so peaks fall at the same
				// speed at 60 Hz, at 120 Hz and with reduced motion.
				dirty = drawPeaks(
					context,
					size,
					bands,
					peaks,
					PEAK_RELEASE_PER_FRAME ** (elapsedMs / FRAME_MS)
				);
			}
		};

		const unsubscribe = subscribeFrame(draw);
		return () => {
			unsubscribe();
			observer.disconnect();
		};
	});
</script>

<canvas
	bind:this={ref}
	{@attach (node) => {
		canvas = node;
	}}
	aria-hidden="true"
	class={cn("[grid-column:2] [grid-row:1] size-full min-h-0", className)}
	data-slot="spectrum-canvas"
	{...restProps}
></canvas>
