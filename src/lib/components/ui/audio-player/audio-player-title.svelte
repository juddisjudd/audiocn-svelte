<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerTitleProps = WithElementRef<
		HTMLAttributes<HTMLSpanElement>,
		HTMLSpanElement
	>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: AudioPlayerTitleProps = $props();
</script>

<span
	bind:this={ref}
	class={cn("truncate text-sm font-medium", className)}
	data-slot="audio-player-title"
	{...restProps}
>
	{@render children?.()}
</span>
