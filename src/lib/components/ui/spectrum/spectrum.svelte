<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { linearTaper, logTaper } from "#lib/audio/taper.js";
	import type { FrameSource, VisualFrame } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	import {
		setSpectrum,
		type SpectrumLatestFrame,
		type SpectrumVariant,
	} from "./spectrum-context.svelte.js";

	export type SpectrumProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		source?: FrameSource<VisualFrame> | null;
		/** Default `bars`. */
		variant?: SpectrumVariant;
		/** The level range the bands cover. Match your analyser. Default −100 / −30. */
		minDb?: number;
		maxDb?: number;
		/** The frequency range the bands cover. Match your analyser. Default 40 / 16000. */
		minHz?: number;
		maxHz?: number;
		/** Frequency axis law. Default `log`. */
		scale?: "log" | "linear";
		/** Keep falling peak markers. Default false. */
		peakHold?: boolean;
		/** Draw grid lines. Default true. */
		grid?: boolean;
	};
</script>

<script lang="ts">
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";

	import SpectrumCanvas from "./spectrum-canvas.svelte";
	import SpectrumFrequencyAxis from "./spectrum-frequency-axis.svelte";
	import SpectrumLevelAxis from "./spectrum-level-axis.svelte";

	let {
		ref = $bindable(null),
		source,
		variant = "bars",
		minDb = -100,
		maxDb = -30,
		minHz = 40,
		maxHz = 16_000,
		scale = "log",
		peakHold = false,
		grid = true,
		class: className,
		children,
		...restProps
	}: SpectrumProps = $props();

	const latest: SpectrumLatestFrame = { frame: null, version: 0 };
	const frameSource = $derived(source);

	useFrameSource(
		() => frameSource,
		(frame) => {
			latest.frame = frame;
			latest.version += 1;
		}
	);

	const frequencyTaper = $derived(
		scale === "log" ? logTaper(minHz, maxHz) : linearTaper(minHz, maxHz)
	);

	setSpectrum({
		get frequencyTaper() {
			return frequencyTaper;
		},
		get grid() {
			return grid;
		},
		latest,
		get maxDb() {
			return maxDb;
		},
		get maxHz() {
			return maxHz;
		},
		get minDb() {
			return minDb;
		},
		get minHz() {
			return minHz;
		},
		get peakHold() {
			return peakHold;
		},
		get variant() {
			return variant;
		},
	});
</script>

<div
	bind:this={ref}
	aria-label="Frequency spectrum"
	class={cn(
		"grid h-40 w-full grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-1 [--spectrum-grid:var(--border)] [--spectrum-peak:var(--foreground)] [--spectrum:var(--primary)]",
		className
	)}
	data-slot="spectrum"
	data-variant={variant}
	role="img"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<SpectrumLevelAxis />
		<SpectrumCanvas />
		<SpectrumFrequencyAxis />
	{/if}
</div>
