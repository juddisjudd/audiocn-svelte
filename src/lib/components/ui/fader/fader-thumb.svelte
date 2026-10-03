<script lang="ts" module>
	import { Slider as SliderPrimitive } from "bits-ui";
	import { tv } from "tailwind-variants";

	const thumbVariants = tv({
		base: "bg-background ring-foreground/15 hover:ring-ring/30 focus-visible:ring-ring/40 data-dragging:ring-ring/30 block shrink-0 shadow-sm ring-1 outline-hidden transition-[box-shadow] hover:ring-4 focus-visible:ring-4 data-disabled:pointer-events-none data-dragging:ring-4",
		variants: {
			orientation: {
				horizontal: "",
				vertical: "",
			},
			variant: {
				console: "border-border rounded-sm border",
				default: "size-(--fader-thumb-size) rounded-full",
			},
		},
		compoundVariants: [
			{
				class:
					"h-[calc(var(--fader-thumb-size)*1.6)] w-[calc(var(--fader-thumb-size)*0.7)] bg-[linear-gradient(to_right,transparent_calc(50%-0.5px),var(--foreground)_calc(50%-0.5px),var(--foreground)_calc(50%+0.5px),transparent_calc(50%+0.5px))]",
				orientation: "horizontal",
				variant: "console",
			},
			{
				class:
					"h-[calc(var(--fader-thumb-size)*0.7)] w-[calc(var(--fader-thumb-size)*1.8)] bg-[linear-gradient(to_bottom,transparent_calc(50%-0.5px),var(--foreground)_calc(50%-0.5px),var(--foreground)_calc(50%+0.5px),transparent_calc(50%+0.5px))]",
				orientation: "vertical",
				variant: "console",
			},
		],
		defaultVariants: {
			orientation: "horizontal",
			variant: "default",
		},
	});

	export type FaderThumbProps = Omit<SliderPrimitive.ThumbProps, "index" | "child" | "children">;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";
	import { thumbStyle, useFader } from "./fader-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		ondblclick,
		onkeydown,
		...restProps
	}: FaderThumbProps = $props();

	const fader = useFader("FaderThumb");

	const handleDoubleClick: FaderThumbProps["ondblclick"] = (event) => {
		ondblclick?.(event);
		if (event.defaultPrevented || fader.disabled) {
			return;
		}
		fader.change(fader.resetValue, { event, reason: "reset" });
		fader.commit(fader.resetValue);
	};

	// Runs before bits-ui's handler, which skips any key handled here.
	const handleKeyDown: FaderThumbProps["onkeydown"] = (event) => {
		onkeydown?.(event);
		if (!event.defaultPrevented) {
			fader.handleKeyDown(event);
		}
	};
</script>

<SliderPrimitive.Thumb
	bind:ref
	index={0}
	aria-label={fader.ariaLabel}
	aria-labelledby={fader.ariaLabelledBy}
	aria-valuetext={fader.format(fader.value)}
	data-slot="fader-thumb"
	class={cn(thumbVariants({ orientation: fader.orientation, variant: fader.variant }), className)}
	{style}
	ondblclick={handleDoubleClick}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#snippet child({ props })}
		<span
			{...props}
			aria-valuemin={0}
			aria-valuemax={1}
			aria-valuenow={fader.position}
			data-dragging={fader.dragging ? "" : undefined}
			style="{props.style ?? ''}; {thumbStyle(fader.position, fader.orientation)}"
		></span>
	{/snippet}
</SliderPrimitive.Thumb>
