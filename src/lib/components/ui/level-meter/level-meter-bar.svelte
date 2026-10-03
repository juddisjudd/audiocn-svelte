<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type LevelMeterBarProps = WithElementRef<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> & {
		/** Which measurement this bar shows. Layer a `rms` and a `peak` bar for a dual meter. Default `peak`. */
		measure?: "peak" | "rms";
	};
</script>

<script lang="ts">
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let {
		ref = $bindable(null),
		measure = "peak",
		class: className,
		...restProps
	}: LevelMeterBarProps = $props();

	const context = useLevelMeterContext("LevelMeterBar");
	const horizontal = $derived(context.orientation === "horizontal");
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	data-measure={measure}
	data-slot="level-meter-bar"
	class={cn(
		"absolute inset-0 overflow-hidden",
		measure === "rms"
			? "[--meter-bar-level:var(--meter-rms)]"
			: "[--meter-bar-level:var(--meter-level)]",
		horizontal
			? "translate-x-[calc((var(--meter-bar-level)_-_1)_*_100%)]"
			: "translate-y-[calc((1_-_var(--meter-bar-level))_*_100%)]",
		className
	)}
	{...restProps}
>
	<div
		class={cn(
			"absolute inset-0 bg-(image:--meter-fill) mask-(--meter-mask)",
			horizontal
				? "translate-x-[calc((1_-_var(--meter-bar-level))_*_100%)]"
				: "translate-y-[calc((var(--meter-bar-level)_-_1)_*_100%)]"
		)}
		data-slot="level-meter-fill"
	></div>
</div>
