<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	import { useWaveform } from "./waveform-context.svelte.js";

	export type WaveformMarkerProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Position in seconds. */
		time: number;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		time,
		class: className,
		children,
		...restProps
	}: WaveformMarkerProps = $props();

	const waveform = useWaveform("WaveformMarker");
</script>

<div
	bind:this={ref}
	class={cn(
		"pointer-events-none absolute inset-y-0 left-(--marker-position) w-px bg-meter-warn",
		className
	)}
	data-slot="waveform-marker"
	style:--marker-position={`${waveform.timeToPosition(time) * 100}%`}
	{...restProps}
>
	{#if children}
		<span
			class="absolute top-0 left-1 rounded-sm bg-meter-warn/20 px-1 text-[0.625rem] font-medium whitespace-nowrap text-foreground"
		>
			{@render children()}
		</span>
	{/if}
</div>
