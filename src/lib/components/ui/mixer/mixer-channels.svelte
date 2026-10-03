<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	const FOCUSABLE = "input, button, [tabindex]:not([tabindex='-1'])";
	const STRIP_SELECTOR = "[data-slot='channel-strip']";

	type ChannelsKeyboardEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement };

	const focusNeighbour = (event: ChannelsKeyboardEvent, direction: number) => {
		const target = event.target as HTMLElement;
		const strip = target.closest<HTMLElement>(STRIP_SELECTOR);
		if (!strip) {
			return false;
		}
		const container = event.currentTarget;
		const strips = [...container.querySelectorAll<HTMLElement>(STRIP_SELECTOR)];
		const neighbour = strips[strips.indexOf(strip) + direction];
		if (!neighbour) {
			return false;
		}
		const slot = target.closest<HTMLElement>("[data-slot]")?.dataset.slot;
		const match = slot ? neighbour.querySelector<HTMLElement>(`[data-slot='${slot}']`) : null;
		const focusTarget = match?.matches(FOCUSABLE)
			? match
			: (match?.querySelector<HTMLElement>(FOCUSABLE) ??
				neighbour.querySelector<HTMLElement>(FOCUSABLE));
		if (!focusTarget) {
			return false;
		}
		focusTarget.focus();
		return true;
	};

	export type MixerChannelsProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Scroll along the strip axis when strips overflow. Default true. */
		scrollable?: boolean;
	};
</script>

<script lang="ts">
	import { getMixerContext } from "./mixer-context.svelte.js";

	let {
		ref = $bindable(null),
		scrollable = true,
		class: className,
		children,
		onkeydowncapture,
		...restProps
	}: MixerChannelsProps = $props();

	const mixer = getMixerContext("MixerChannels");

	const handleKeyDown = (event: ChannelsKeyboardEvent) => {
		onkeydowncapture?.(event);
		if (event.defaultPrevented || !(event.ctrlKey || event.metaKey)) {
			return;
		}
		const previous = mixer.orientation === "horizontal" ? "ArrowUp" : "ArrowLeft";
		const next = mixer.orientation === "horizontal" ? "ArrowDown" : "ArrowRight";
		let direction = 0;
		if (event.key === previous) {
			direction = -1;
		} else if (event.key === next) {
			direction = 1;
		}
		if (direction !== 0 && focusNeighbour(event, direction)) {
			event.preventDefault();
			event.stopPropagation();
		}
	};
</script>

<div
	bind:this={ref}
	data-slot="mixer-channels"
	class={cn(
		"flex min-h-0 min-w-0 gap-(--mixer-gap) [grid-area:channels]",
		mixer.orientation === "horizontal" ? "flex-col" : "flex-row",
		scrollable && (mixer.orientation === "horizontal" ? "overflow-y-auto" : "overflow-x-auto"),
		"empty:hidden",
		className
	)}
	onkeydowncapture={handleKeyDown}
	{...restProps}
>
	{@render children?.()}
</div>
