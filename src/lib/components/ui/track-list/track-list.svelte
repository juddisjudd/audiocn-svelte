<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	const ITEM_SELECTOR = "[data-slot='track-list-item']:not([data-disabled])";

	export const trackListVariants = tv({
		base: "group/track-list flex w-full flex-col",
		variants: {
			size: {
				default: "gap-0.5 [--track-row-height:3rem]",
				lg: "gap-1 [--track-row-height:3.5rem]",
				sm: "gap-0 [--track-row-height:2.25rem]",
			},
			variant: {
				default: "",
				outline: "rounded-xl border p-1",
			},
		},
		defaultVariants: { size: "default", variant: "default" },
	});

	export type TrackListSize = VariantProps<typeof trackListVariants>["size"];
	export type TrackListVariant = VariantProps<typeof trackListVariants>["variant"];

	export type TrackListProps = WithElementRef<HTMLAttributes<HTMLUListElement>> & {
		size?: TrackListSize;
		variant?: TrackListVariant;
	};

	type ListKeyboardEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLUListElement };

	const moveFocus = (event: ListKeyboardEvent) => {
		const items = [...event.currentTarget.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
		const current = (event.target as HTMLElement).closest<HTMLElement>(ITEM_SELECTOR);
		if (!current || current !== event.target) {
			return;
		}
		const index = items.indexOf(current);
		const targets: Record<string, number> = {
			ArrowDown: index + 1,
			ArrowUp: index - 1,
			End: items.length - 1,
			Home: 0,
		};
		const targetIndex = targets[event.key];
		const next = targetIndex === undefined ? undefined : items[targetIndex];
		if (next) {
			event.preventDefault();
			next.focus();
		}
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		size = "default",
		variant = "default",
		class: className,
		children,
		onkeydown,
		...restProps
	}: TrackListProps = $props();

	const handleKeyDown = (event: ListKeyboardEvent) => {
		onkeydown?.(event);
		if (!event.defaultPrevented) {
			moveFocus(event);
		}
	};
</script>

<ul
	bind:this={ref}
	data-size={size}
	data-slot="track-list"
	class={cn(trackListVariants({ size, variant }), className)}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{@render children?.()}
</ul>
