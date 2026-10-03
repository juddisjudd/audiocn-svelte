<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> = $props();

	const context = useLevelMeterContext("LevelMeterChannels");
</script>

<div
	bind:this={ref}
	data-orientation={context.orientation}
	data-slot="level-meter-channels"
	class={cn(
		"relative flex min-h-0 min-w-0 flex-1 gap-(--meter-gap)",
		context.orientation === "horizontal" ? "flex-col" : "h-full flex-row",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
