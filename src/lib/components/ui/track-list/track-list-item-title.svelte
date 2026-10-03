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
	data-slot="track-list-item-title"
	class={cn("group-data-active/track-list-item:text-primary truncate font-medium", className)}
	{...restProps}
>
	{@render children?.()}
</span>
