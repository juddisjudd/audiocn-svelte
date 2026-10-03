<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { formatTime } from "#lib/audio/time.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	import { useWaveform } from "./waveform-context.svelte.js";

	export type WaveformHoverProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		format?: (time: number) => string;
	};

	const defaultHoverFormat = (value: number) => formatTime(value);
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		format = defaultHoverFormat,
		class: className,
		...restProps
	}: WaveformHoverProps = $props();

	const waveform = useWaveform("WaveformHover");
</script>

{#if waveform.interactive && waveform.hover !== null}
	<div
		bind:this={ref}
		aria-hidden="true"
		class={cn(
			"pointer-events-none absolute inset-y-0 left-(--waveform-hover) w-px bg-foreground/40",
			className
		)}
		data-slot="waveform-hover"
		style:--waveform-hover={`${waveform.timeToPosition(waveform.hover) * 100}%`}
		{...restProps}
	>
		<span
			class="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[0.625rem] whitespace-nowrap text-background tabular-nums"
		>
			{format(waveform.hover)}
		</span>
	</div>
{/if}
