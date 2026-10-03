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
	data-slot="channel-strip-description"
	class={cn("text-muted-foreground truncate text-xs leading-tight", className)}
	{...restProps}
>
	{@render children?.()}
</span>
