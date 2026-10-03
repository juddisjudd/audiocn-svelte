<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="track-list-item-duration"
	class={cn("text-muted-foreground shrink-0 font-mono text-xs tabular-nums", className)}
	{...restProps}
>
	{@render children?.()}
</span>
