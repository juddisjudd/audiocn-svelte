<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerDescriptionProps = WithElementRef<
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
	}: AudioPlayerDescriptionProps = $props();
</script>

<span
	bind:this={ref}
	class={cn("truncate text-xs text-muted-foreground", className)}
	data-slot="audio-player-description"
	{...restProps}
>
	{@render children?.()}
</span>
