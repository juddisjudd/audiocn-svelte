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

<!-- @component Groups a title and description so they stack next to an icon. -->
<div
	bind:this={ref}
	data-slot="channel-strip-text"
	class={cn(
		"flex min-w-0 flex-1 flex-col gap-0.5 group-data-[orientation=horizontal]/channel-strip:min-w-20",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
