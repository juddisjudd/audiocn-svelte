<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	import { DEFAULT_FREQUENCY_TICKS, useSpectrum } from "./spectrum-context.svelte.js";

	export type SpectrumFrequencyAxisProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Default 100 Hz, 1 kHz and 10 kHz. */
		ticks?: number[];
		format?: (hz: number) => string;
	};

	const formatHz = (hz: number) => (hz >= 1000 ? `${hz / 1000}k` : String(hz));
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		ticks = DEFAULT_FREQUENCY_TICKS,
		format = formatHz,
		class: className,
		...restProps
	}: SpectrumFrequencyAxisProps = $props();

	const spectrum = useSpectrum("SpectrumFrequencyAxis");
	const shown = $derived(ticks.filter((hz) => hz >= spectrum.minHz && hz <= spectrum.maxHz));
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	class={cn(
		"relative [grid-column:2] [grid-row:2] h-4 text-[0.625rem] text-muted-foreground tabular-nums",
		className
	)}
	data-slot="spectrum-frequency-axis"
	{...restProps}
>
	{#each shown as hz (hz)}
		<span
			class="absolute top-0 left-(--tick-position) -translate-x-1/2"
			style:--tick-position={`${spectrum.frequencyTaper.toPosition(hz) * 100}%`}
		>
			{format(hz)}
		</span>
	{/each}
</div>
