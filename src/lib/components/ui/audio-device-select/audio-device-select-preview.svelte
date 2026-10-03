<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioDeviceSelectPreviewProps = WithElementRef<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: AudioDeviceSelectPreviewProps = $props();
</script>

<div
	bind:this={ref}
	class={cn("overflow-hidden rounded-lg border bg-muted/20 px-2", className)}
	data-slot="audio-device-select-preview"
	{...restProps}
>
	{@render children?.()}
</div>
