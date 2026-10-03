<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { clamp } from "#lib/audio/decibels.js";
	import { formatTime } from "#lib/audio/time.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	import { useWaveform } from "./waveform-context.svelte.js";

	export interface WaveformRegionValue {
		start: number;
		end: number;
	}

	export type WaveformRegionProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Start in seconds. Bindable. */
		start: number;
		/** End in seconds. Bindable. */
		end: number;
		onValueChange?: (value: WaveformRegionValue) => void;
		/** Drag the edges. Default true. */
		resizable?: boolean;
		/** Drag the whole region. Default true. */
		draggable?: boolean;
		/** Shortest region in seconds. Default 0.1. */
		minLength?: number;
	};

	interface RegionDrag {
		kind: "start" | "end" | "move";
		x: number;
		start: number;
		end: number;
	}

	const HANDLE_CLASS =
		"absolute inset-y-0 w-2 cursor-ew-resize rounded-sm bg-primary/60 after:absolute after:inset-y-0 after:-inset-x-1.5 pointer-coarse:after:-inset-x-3 outline-none focus-visible:bg-primary focus-visible:ring-3 focus-visible:ring-ring/30";
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";

	let {
		ref = $bindable(null),
		start = $bindable(),
		end = $bindable(),
		onValueChange,
		resizable = true,
		draggable = true,
		minLength = 0.1,
		class: className,
		children,
		...restProps
	}: WaveformRegionProps = $props();

	const waveform = useWaveform("WaveformRegion");
	// Its own reference, since a prop update from the parent can reset `ref`.
	let region = $state<HTMLDivElement | null>(null);
	let drag: RegionDrag | null = null;

	const secondsPerPixel = () => {
		const width = region?.parentElement?.getBoundingClientRect().width ?? 1;
		return waveform.duration / width;
	};

	const change = (value: WaveformRegionValue) => {
		start = value.start;
		end = value.end;
		onValueChange?.(value);
	};

	const begin = (kind: RegionDrag["kind"]) => (event: PointerEvent) => {
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { end, kind, start, x: event.clientX };
	};

	const move = (event: PointerEvent) => {
		if (!drag) {
			return;
		}
		event.stopPropagation();
		const delta = (event.clientX - drag.x) * secondsPerPixel();
		const { duration } = waveform;
		if (drag.kind === "move") {
			const length = drag.end - drag.start;
			const nextStart = clamp(drag.start + delta, 0, duration - length);
			change({ end: nextStart + length, start: nextStart });
		} else if (drag.kind === "start") {
			change({ end: drag.end, start: clamp(drag.start + delta, 0, drag.end - minLength) });
		} else {
			change({ end: clamp(drag.end + delta, drag.start + minLength, duration), start: drag.start });
		}
	};

	const finish = (event: PointerEvent) => {
		event.stopPropagation();
		drag = null;
	};

	const nudge = (edge: "start" | "end") => (event: KeyboardEvent) => {
		const amount = event.shiftKey ? 1 : 0.1;
		let delta = 0;
		if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			delta = amount;
		} else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			delta = -amount;
		}
		if (delta === 0) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (edge === "start") {
			change({ end, start: clamp(start + delta, 0, end - minLength) });
		} else {
			change({ end: clamp(end + delta, start + minLength, waveform.duration), start });
		}
	};

	const left = $derived(waveform.timeToPosition(start) * 100);
	const width = $derived((waveform.timeToPosition(end) - waveform.timeToPosition(start)) * 100);

	const regionProps = $derived<Partial<HTMLAttributes<HTMLDivElement>>>({
		onlostpointercapture: finish,
		onpointerdown: draggable
			? begin("move")
			: (event: PointerEvent) => {
					event.stopPropagation();
				},
		onpointermove: move,
		onpointerup: finish,
	});
</script>

<div
	bind:this={ref}
	{@attach (node) => {
		region = node;
	}}
	class={cn(
		"absolute inset-y-0 left-(--region-start) w-(--region-size) rounded-sm bg-primary/15 ring-1 ring-primary/40",
		draggable && "cursor-grab active:cursor-grabbing",
		className
	)}
	data-slot="waveform-region"
	style:--region-size={`${width}%`}
	style:--region-start={`${left}%`}
	{...mergeProps(regionProps, restProps)}
>
	{@render children?.()}
	{#if resizable}
		<span
			aria-label="Region start"
			aria-valuemax={Math.round(end)}
			aria-valuemin={0}
			aria-valuenow={Math.round(start)}
			aria-valuetext={formatTime(start)}
			class={cn(HANDLE_CLASS, "-left-1")}
			data-slot="waveform-region-start"
			onkeydown={nudge("start")}
			onpointerdown={begin("start")}
			role="slider"
			tabindex="0"
		></span>
		<span
			aria-label="Region end"
			aria-valuemax={Math.round(waveform.duration)}
			aria-valuemin={Math.round(start)}
			aria-valuenow={Math.round(end)}
			aria-valuetext={formatTime(end)}
			class={cn(HANDLE_CLASS, "-right-1")}
			data-slot="waveform-region-end"
			onkeydown={nudge("end")}
			onpointerdown={begin("end")}
			role="slider"
			tabindex="0"
		></span>
	{/if}
</div>
