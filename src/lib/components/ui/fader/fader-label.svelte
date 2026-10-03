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
		onclick,
		onpointerdown,
		...restProps
	}: FaderLabelProps = $props();

	const fader = useFader("FaderLabel");

	$effect(() => {
		if (id) {
			return fader.registerLabel(id);
		}
	});

	const handleClick: FaderLabelProps["onclick"] = (event) => {
		onclick?.(event);
		if (event.target instanceof Element && event.target.closest("button,input,select,textarea")) {
			return;
		}
		// Keeps a double-click from selecting the label's text.
		if (!event.defaultPrevented && event.detail > 1) {
			event.preventDefault();
		}
		fader.focusThumb();
	};

	const handlePointerDown: FaderLabelProps["onpointerdown"] = (event) => {
		onpointerdown?.(event);
		event.preventDefault();
	};
</script>

<div
	bind:this={ref}
	{id}
	data-slot="fader-label"
	data-disabled={fader.disabled ? "" : undefined}
	data-dragging={fader.dragging ? "" : undefined}
	data-orientation={fader.orientation}
	class={cn("text-sm font-medium", className)}
	onclick={handleClick}
	onpointerdown={handlePointerDown}
	{...restProps}
>
	{@render children?.()}
</div>
