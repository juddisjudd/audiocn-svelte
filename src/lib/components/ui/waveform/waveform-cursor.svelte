<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type WaveformCursorProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), class: className, ...restProps }: WaveformCursorProps = $props();
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	class={cn(
		"pointer-events-none absolute inset-y-0 left-[calc(var(--waveform-position)*100%)] w-0.5 -translate-x-1/2 rounded-full bg-(--waveform-cursor) group-data-loading/waveform:hidden",
		className
	)}
	data-slot="waveform-cursor"
	{...restProps}
></div>
