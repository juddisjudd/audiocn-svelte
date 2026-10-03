<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type FaderResetProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		/** Renders your own element with the reset props. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import { useFader } from "./fader-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		onclick,
		...restProps
	}: FaderResetProps = $props();

	const fader = useFader("FaderReset");
	const modified = $derived(fader.value !== fader.resetValue);

	const mergedProps = $derived(
		mergeProps(
			{
				"aria-label": "Reset",
				class: cn(
					"text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/30 inline-flex h-6 items-center rounded-md px-1.5 text-xs outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-0",
					className
				),
				"data-modified": modified ? "" : undefined,
				"data-slot": "fader-reset",
				disabled: fader.disabled || !modified,
				onclick: (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
					onclick?.(event);
					if (event.defaultPrevented) {
						return;
					}
					fader.change(fader.resetValue, { reason: "reset" });
					fader.commit(fader.resetValue);
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
			Reset
		{/if}
	</button>
{/if}
