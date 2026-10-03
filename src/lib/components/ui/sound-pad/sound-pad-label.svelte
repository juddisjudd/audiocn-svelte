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
	data-slot="sound-pad-label"
	class={cn(
		"relative mt-auto line-clamp-2 text-sm font-medium group-has-data-[variant=ring]/sound-pad:pe-6",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
