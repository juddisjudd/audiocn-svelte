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
	data-slot="channel-strip-controls"
	class={cn("flex items-center justify-center gap-1 [grid-area:controls]", className)}
	{...restProps}
>
	{@render children?.()}
</div>
