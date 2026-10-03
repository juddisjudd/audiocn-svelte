<script lang="ts">
	import type { ClassValue } from "svelte/elements";
	import { clamp } from "#lib/audio/decibels.js";
	import { cn } from "#lib/utils.js";
	import { useKnob } from "./knob-context.svelte.js";
	import { focusDial } from "./knob-utils.js";

	let { class: className, style }: { class?: ClassValue | null; style?: string | null } = $props();

	const knob = useKnob("KnobValue");
	let draft = $state(knob.format(knob.value));
	let done = false;

	const focusInput = (node: HTMLInputElement) => {
		node.focus();
		node.select();
	};

	const finish = (apply: boolean) => {
		if (done) {
			return;
		}
		done = true;
		knob.setEditing(false);
		const parsed = apply ? knob.parse(draft) : null;
		if (parsed === null || Number.isNaN(parsed)) {
			return;
		}
		const next = knob.quantize(
			clamp(parsed, knob.min, knob.max),
			Math.min(knob.fineStep, knob.step)
		);
		knob.change(next, { reason: "input" });
		knob.commit(next);
	};

	const handleKeyDown = (event: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
		if (event.key !== "Enter" && event.key !== "Escape") {
			return;
		}
		event.preventDefault();
		const input = event.currentTarget;
		finish(event.key === "Enter");
		focusDial(input);
	};
</script>

<!--
@component
The inline editor KnobValue shows while a value is typed.
-->
<input
	{@attach focusInput}
	aria-label="Value"
	bind:value={draft}
	class={cn(
		"h-4 w-(--knob-value-width) min-w-0 rounded-sm bg-background p-0 text-center font-mono text-xs tabular-nums ring-1 ring-ring/50 outline-none focus-visible:ring-2 focus-visible:ring-foreground",
		className
	)}
	data-slot="knob-value-input"
	onblur={() => finish(true)}
	onkeydown={handleKeyDown}
	{style}
	style:--knob-value-width="{knob.valueWidth}ch"
/>
