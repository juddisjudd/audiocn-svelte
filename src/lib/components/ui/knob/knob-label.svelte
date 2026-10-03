<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type KnobLabelProps = WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		ondblclick,
		children,
		...restProps
	}: KnobLabelProps = $props();

	const knob = useKnob("KnobLabel");

	const handleDoubleClick = (
		event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) => {
		ondblclick?.(event);
		if (!knob.disabled) {
			knob.setEditing(true);
		}
	};
</script>

<span
	bind:this={ref}
	class={cn("text-xs font-medium", className)}
	data-slot="knob-label"
	id={knob.labelId}
	ondblclick={handleDoubleClick}
	{...restProps}
>
	{@render children?.()}
</span>
