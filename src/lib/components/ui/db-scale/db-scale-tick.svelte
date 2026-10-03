<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type DbScaleTickProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		value: number;
		/** Major ticks are longer. Default true. */
		major?: boolean;
	};
</script>

<script lang="ts">
	import { alignClass, markClass, useDbScaleContext } from "./db-scale-utils.js";

	let {
		ref = $bindable(null),
		value,
		major = true,
		class: className,
		style,
		children,
		...restProps
	}: DbScaleTickProps = $props();

	const context = useDbScaleContext();
	const position = $derived(context.taper.toPosition(value));
	const horizontal = $derived(context.orientation === "horizontal");
	const reversed = $derived(context.side === "start");
</script>

<div
	bind:this={ref}
	data-major={major ? "" : undefined}
	data-slot="db-scale-tick"
	data-value={value}
	class={cn(
		"absolute flex items-center gap-0.5",
		horizontal
			? "top-0 left-(--tick-position) h-full flex-col"
			: "bottom-(--tick-position) left-0 w-full flex-row",
		reversed && (horizontal ? "flex-col-reverse" : "flex-row-reverse"),
		alignClass(context.orientation, position),
		className
	)}
	style={`--tick-position: ${position * 100}%;${style ? ` ${style}` : ""}`}
	{...restProps}
>
	<span class={cn("shrink-0 bg-border", markClass(horizontal, major))} data-slot="db-scale-mark"
	></span>
	{#if context.labels}
		<!-- Right-aligned so the last digits of a vertical scale line up. -->
		<span
			class={cn("data-hidden:invisible", !horizontal && "flex-1 text-end")}
			data-slot="db-scale-label"
		>
			{#if children}
				{@render children()}
			{:else}
				{context.format(value)}
			{/if}
		</span>
	{/if}
</div>
