<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type ParameterSliderHeaderProps = WithElementRef<
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
	}: ParameterSliderHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="parameter-slider-header"
	class={cn("flex min-h-6 items-center gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
