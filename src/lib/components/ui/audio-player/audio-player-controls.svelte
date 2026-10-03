<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerControlsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: AudioPlayerControlsProps = $props();
</script>

<div
	bind:this={ref}
	class={cn("flex items-center gap-1", className)}
	data-slot="audio-player-controls"
	{...restProps}
>
	{@render children?.()}
</div>
