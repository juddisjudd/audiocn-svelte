<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type VolumeControlValueProps = WithElementRef<
		HTMLAttributes<HTMLSpanElement>,
		HTMLSpanElement
	>;
</script>

<script lang="ts">
	import { PERCENT, useVolumeControl } from "./volume-control-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: VolumeControlValueProps = $props();

	const volume = useVolumeControl("VolumeControlValue");
</script>

<span
	bind:this={ref}
	data-slot="volume-control-value"
	class={cn(
		"w-9 shrink-0 text-end font-mono text-xs text-muted-foreground tabular-nums",
		className
	)}
	{...restProps}
>
	{volume.muted ? "0%" : `${Math.round(volume.position * PERCENT)}%`}
</span>
