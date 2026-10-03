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
	aria-hidden="true"
	data-slot="sound-pad-icon"
	class={cn("relative text-(--pad-accent) [&_svg:not([class*='size-'])]:size-5", className)}
	{...restProps}
>
	{@render children?.()}
</span>
