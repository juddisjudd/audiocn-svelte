<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type FaderValueProps = WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLElement> & {
		/** Click to type a value. Default false. */
		editable?: boolean;
	};
</script>

<script lang="ts">
	import { clamp, SILENCE_DB } from "#lib/audio/decibels.js";
	import { parseDb, useFader, widestValue } from "./fader-utils.js";

	let {
		ref = $bindable(null),
		editable = false,
		class: className,
		style,
		...restProps
	}: FaderValueProps = $props();

	const fader = useFader("FaderValue");

	// A fixed width, so moving the fader never shifts the layout around it.
	const width = $derived(`${widestValue(fader.format, fader.min, fader.max)}ch`);

	let editing = $state(false);
	let draft = $state("");

	const focusInput = (node: HTMLInputElement) => {
		node.focus();
		node.select();
	};

	const finish = (apply: boolean) => {
		if (!editing) {
			return;
		}
		editing = false;
		if (!apply) {
			return;
		}
		const parsed = parseDb(draft);
		if (parsed === null) {
			return;
		}
		const next = parsed === SILENCE_DB ? fader.min : clamp(parsed, fader.min, fader.max);
		fader.change(next, { reason: "input" });
		fader.commit(next);
	};

	const startEditing = () => {
		draft = fader.value === SILENCE_DB ? "-inf" : String(fader.value);
		editing = true;
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Enter") {
			finish(true);
		} else if (event.key === "Escape") {
			finish(false);
		}
	};
</script>

{#if editing}
	<input
		bind:this={ref}
		bind:value={draft}
		{@attach focusInput}
		aria-label="Value in dB"
		data-slot="fader-value-input"
		class={cn(
			"h-6 w-[calc(var(--fader-value-width)+0.75rem)] rounded-md border bg-background px-[calc(0.375rem-1px)] text-end font-mono text-xs tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
			className
		)}
		{style}
		style:--fader-value-width={width}
		onblur={() => finish(true)}
		onkeydown={handleKeyDown}
	/>
{:else if editable}
	<button
		bind:this={ref}
		type="button"
		data-slot="fader-value"
		class={cn(
			"h-6 w-[calc(var(--fader-value-width)+0.75rem)] shrink-0 rounded-md text-end font-mono text-xs text-muted-foreground tabular-nums outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30",
			"px-1.5",
			className
		)}
		{style}
		style:--fader-value-width={width}
		disabled={fader.disabled}
		onclick={startEditing}
	>
		{fader.format(fader.value)}
	</button>
{:else}
	<span
		bind:this={ref}
		data-slot="fader-value"
		class={cn(
			"inline-block w-(--fader-value-width) shrink-0 text-end font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums",
			className
		)}
		{style}
		style:--fader-value-width={width}
		{...restProps}
	>
		{fader.format(fader.value)}
	</span>
{/if}
