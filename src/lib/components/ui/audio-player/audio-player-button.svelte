<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerButtonProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		/** Renders your own element with the button props. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};

	type ButtonState = Record<string, boolean>;
	type ButtonMouseEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";

	import { buttonClass } from "./audio-player-utils.js";

	let {
		ref = $bindable(null),
		slotName,
		label,
		action,
		disabled,
		state = {},
		class: className,
		children,
		child,
		onclick,
		...restProps
	}: AudioPlayerButtonProps & {
		/** The part's `data-slot`. */
		slotName: string;
		/** The accessible name, and the text shown without children. */
		label: string;
		action: () => void;
		state?: ButtonState;
	} = $props();

	const stateAttributes = $derived(
		Object.fromEntries(
			Object.entries(state)
				.filter(([, on]) => on)
				.map(([key]) => [`data-${key}`, ""])
		)
	);

	const mergedProps = $derived(
		mergeProps(
			{
				...stateAttributes,
				"aria-label": label,
				class: cn(buttonClass, !children && "w-auto px-2.5", className),
				"data-slot": slotName,
				disabled,
				onclick: (event: ButtonMouseEvent) => {
					onclick?.(event);
					if (!event.defaultPrevented) {
						action();
					}
				},
				type: "button" as const,
			},
			restProps
		)
	);
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} {...mergedProps}>
		{#if children}
			{@render children()}
		{:else}
			<span class="text-xs">{label}</span>
		{/if}
	</button>
{/if}
