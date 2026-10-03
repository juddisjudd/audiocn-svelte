<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type KnobValueProps = WithElementRef<
		Omit<HTMLAttributes<HTMLSpanElement>, "children">,
		HTMLSpanElement
	> & {
		/** Double-click the value, or press Enter on the dial, to type one. Default true. */
		editable?: boolean;
	};
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import KnobValueInput from "./knob-value-input.svelte";

	let {
		ref = $bindable(null),
		editable = true,
		class: className,
		style,
		ondblclick,
		...restProps
	}: KnobValueProps = $props();

	const knob = useKnob("KnobValue");

	const handleDoubleClick = (
		event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) => {
		ondblclick?.(event);
		if (editable && !knob.disabled) {
			knob.setEditing(true);
		}
	};
</script>

{#if editable && knob.editing}
	<KnobValueInput class={className} {style} />
{:else}
	<span
		bind:this={ref}
		class={cn(
			"inline-block min-w-(--knob-value-width) text-center font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums",
			editable && !knob.disabled && "cursor-text",
			className
		)}
		data-slot="knob-value"
		ondblclick={handleDoubleClick}
		{style}
		style:--knob-value-width="{knob.valueWidth}ch"
		{...restProps}
	>
		{knob.format(knob.value)}
	</span>
{/if}
