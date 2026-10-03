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
	data-slot="channel-strip-actions"
	class={cn("ml-auto flex shrink-0 items-center gap-1", className)}
	{...restProps}
>
	{@render children?.()}
</div>
