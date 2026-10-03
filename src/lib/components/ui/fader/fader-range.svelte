<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type FaderRangeProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { useFader } from "./fader-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: FaderRangeProps = $props();

	const fader = useFader("FaderRange");
	const start = $derived(Math.min(fader.originPosition, fader.position) * 100);
	const end = $derived(Math.max(fader.originPosition, fader.position) * 100);
</script>

<div
	bind:this={ref}
	data-slot="fader-range"
	class={cn(
		"absolute rounded-full bg-primary",
		fader.orientation === "horizontal"
			? "inset-y-0 left-(--fader-range-start) w-(--fader-range-size)"
			: "inset-x-0 bottom-(--fader-range-start) h-(--fader-range-size)",
		className
	)}
	style:--fader-range-size="{end - start}%"
	style:--fader-range-start="{start}%"
	{...restProps}
></div>
