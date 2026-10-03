<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type FaderLabelProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { useFader } from "./fader-utils.js";

	const uid = $props.id();

	let {
		ref = $bindable(null),
		id = uid,
		class: className,
		children,
		...restProps
	}: FaderLabelProps = $props();

	const fader = useFader("FaderLabel");

	$effect(() => {
		if (id) {
			return fader.registerLabel(id);
		}
	});
</script>

<div
	bind:this={ref}
	{id}
	data-slot="fader-label"
	class={cn("text-sm font-medium", className)}
	{...restProps}
>
	{@render children?.()}
</div>
