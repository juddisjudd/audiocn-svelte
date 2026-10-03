<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	import { useSpectrum } from "./spectrum-context.svelte.js";

	const LEVEL_TICK_DB = 12;

	export type SpectrumLevelAxisProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Default: every 12 dB inside the range. */
		ticks?: number[];
		format?: (db: number) => string;
	};

	const formatLevel = (db: number) => String(Math.round(db));
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		ticks,
		format = formatLevel,
		class: className,
		...restProps
	}: SpectrumLevelAxisProps = $props();

	const spectrum = useSpectrum("SpectrumLevelAxis");
	const values = $derived(
		ticks ??
			Array.from(
				{ length: Math.floor((spectrum.maxDb - spectrum.minDb) / LEVEL_TICK_DB) + 1 },
				(_, index) => spectrum.maxDb - index * LEVEL_TICK_DB
			)
	);
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	class={cn(
		"relative [grid-column:1] [grid-row:1] w-7 text-[0.625rem] text-muted-foreground tabular-nums",
		className
	)}
	data-slot="spectrum-level-axis"
	{...restProps}
>
	{#each values as db (db)}
		<span
			class="absolute right-0 bottom-(--tick-position) translate-y-1/2"
			style:--tick-position={`${((db - spectrum.minDb) / (spectrum.maxDb - spectrum.minDb)) * 100}%`}
		>
			{format(db)}
		</span>
	{/each}
</div>
