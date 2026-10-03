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
	data-slot="mixer-header"
	class={cn("flex min-w-0 items-center gap-2 [grid-area:header]", className)}
	{...restProps}
>
	{@render children?.()}
</div>
