<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";
	import { getMixerContext } from "./mixer-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();

	const mixer = getMixerContext("MixerTitle");
</script>

<h2
	bind:this={ref}
	id={mixer.titleId}
	data-slot="mixer-title"
	class={cn("font-heading mr-auto text-base font-medium", className)}
	{...restProps}
>
	{@render children?.()}
</h2>
