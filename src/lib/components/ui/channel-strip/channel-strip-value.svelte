<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="channel-strip-value"
	class={cn(
		// Wide enough for "−60.0 dB", so dragging a fader never resizes the row.
		"text-muted-foreground flex min-w-[8ch] items-center justify-end font-mono text-xs whitespace-nowrap tabular-nums [grid-area:value] group-data-[orientation=vertical]/channel-strip:justify-center",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
