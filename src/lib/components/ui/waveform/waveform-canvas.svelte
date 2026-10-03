<script lang="ts" module>
	import type { HTMLCanvasAttributes } from "svelte/elements";

	import { resampleLevels } from "#lib/audio/bands.js";
	import { subscribeFrame } from "#lib/audio/frame-loop.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	import { useWaveform } from "./waveform-context.svelte.js";

	const COLOR_REFRESH_FRAMES = 30;

	export type WaveformCanvasProps = WithElementRef<HTMLCanvasAttributes, HTMLCanvasElement>;

	const drawRoundedBar = (
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
</script>

<script lang="ts">
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";

	let { ref = $bindable(null), class: className, ...restProps }: WaveformCanvasProps = $props();

	const waveform = useWaveform("WaveformCanvas");
	// Its own reference, since a prop update from the parent can reset `ref`.
	let canvas = $state<HTMLCanvasElement | null>(null);
	const visible = useVisibility(() => canvas);

	$effect(() => {
		const element = canvas;
		const context = element?.getContext("2d");
		if (!(element && context)) {
			return;
		}
		const { barGap, barRadius, barWidth, loading, peaks, progress, variant } = waveform;
		const size = { height: 0, width: 0 };
		let ratio = 1;
		let colors = { played: "", unplayed: "" };
		let framesSinceColor = COLOR_REFRESH_FRAMES;
		let lastProgress = -1;
		let levels = new Float32Array(0);

		const resize = () => {
			const rect = element.getBoundingClientRect();
			ratio = window.devicePixelRatio || 1;
			size.width = rect.width;
			size.height = rect.height;
			element.width = Math.max(1, Math.round(size.width * ratio));
			element.height = Math.max(1, Math.round(size.height * ratio));
			const count = Math.max(1, Math.floor((size.width + barGap) / (barWidth + barGap)));
			levels = new Float32Array(count);
			if (peaks && peaks.length > 0) {
				resampleLevels(peaks, 0, peaks.length, levels);
			}
			lastProgress = -1;
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(element);

		const drawPass = (color: string, clipWidth: number) => {
			context.save();
			context.beginPath();
			context.rect(0, 0, clipWidth, size.height);
			context.clip();
			context.fillStyle = color;
			context.strokeStyle = color;
			const pitch = barWidth + barGap;
			const middle = size.height / 2;
			if (variant === "line") {
				context.lineWidth = 1.5;
				context.beginPath();
				for (let index = 0; index < levels.length; index += 1) {
					const x = index * pitch + barWidth / 2;
					const y = middle - (levels[index] ?? 0) * (middle - 1);
					if (index === 0) {
						context.moveTo(x, y);
					} else {
						context.lineTo(x, y);
					}
				}
				for (let index = levels.length - 1; index >= 0; index -= 1) {
					const x = index * pitch + barWidth / 2;
					context.lineTo(x, middle + (levels[index] ?? 0) * (middle - 1));
				}
				context.closePath();
				context.fill();
			} else {
				for (let index = 0; index < levels.length; index += 1) {
					const level = levels[index] ?? 0;
					const barHeight = Math.max(2, level * size.height);
					const y = variant === "mirror" ? middle - barHeight / 2 : size.height - barHeight;
					drawRoundedBar(context, index * pitch, y, barWidth, barHeight, barRadius);
				}
			}
			context.restore();
		};

		const draw = () => {
			framesSinceColor += 1;
			if (framesSinceColor >= COLOR_REFRESH_FRAMES) {
				framesSinceColor = 0;
				const style = getComputedStyle(element);
				const next = {
					played: style.getPropertyValue("--waveform-progress").trim() || style.color,
					unplayed: style.getPropertyValue("--waveform").trim() || style.color,
				};
				if (next.played !== colors.played || next.unplayed !== colors.unplayed) {
					colors = next;
					lastProgress = -1;
				}
			}
			const current = progress.current;
			// Off screen, leave lastProgress alone so it repaints when it returns.
			if (current === lastProgress || size.width === 0 || !visible.current) {
				return;
			}
			lastProgress = current;
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			context.clearRect(0, 0, size.width, size.height);
			if (loading || !peaks) {
				return;
			}
			drawPass(colors.unplayed, size.width);
			drawPass(colors.played, current * size.width);
		};

		const unsubscribe = subscribeFrame(draw);
		return () => {
			unsubscribe();
			observer.disconnect();
		};
	});
</script>

{#if waveform.loading}
	<div
		aria-hidden="true"
		class="absolute inset-0 animate-pulse rounded-lg bg-muted"
		data-slot="waveform-skeleton"
	></div>
{/if}
<canvas
	bind:this={ref}
	{@attach (node) => {
		canvas = node;
	}}
	aria-hidden="true"
	class={cn("absolute inset-0 size-full", className)}
	data-slot="waveform-canvas"
	{...restProps}
></canvas>
