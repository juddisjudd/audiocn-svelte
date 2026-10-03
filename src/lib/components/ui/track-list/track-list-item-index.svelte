<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";
	import { getTrackListItemContext } from "./track-list-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();

	const item = getTrackListItemContext();
</script>

<span
	bind:this={ref}
	data-slot="track-list-item-index"
	class={cn(
		"text-muted-foreground group-data-active/track-list-item:text-primary flex w-5 shrink-0 items-center justify-center font-mono text-xs tabular-nums",
		className
	)}
	{...restProps}
>
	{#if item.playing}
		<span aria-label="Playing" class="flex h-3 items-end gap-px" role="img">
			<span
				class="h-3 w-0.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
			></span>
			<span
				class="h-2 w-0.5 animate-pulse rounded-full bg-current [animation-delay:200ms] motion-reduce:animate-none"
			></span>
			<span
				class="h-2.5 w-0.5 animate-pulse rounded-full bg-current [animation-delay:400ms] motion-reduce:animate-none"
			></span>
		</span>
	{:else}
		{@render children?.()}
	{/if}
</span>
