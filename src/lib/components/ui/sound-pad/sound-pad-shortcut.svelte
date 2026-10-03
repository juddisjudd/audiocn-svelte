<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { Kbd } from "#lib/components/ui/kbd/index.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { getSoundPadContext } from "./sound-pad-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();

	const pad = getSoundPadContext();
</script>

{#if children || pad.hotkey}
	<Kbd
		bind:ref
		data-slot="sound-pad-shortcut"
		class={cn("absolute top-2 right-2 uppercase", className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			{pad.hotkey}
		{/if}
	</Kbd>
{/if}
