<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type ParameterSliderInputProps = WithElementRef<
		Omit<HTMLInputAttributes, "value" | "type">,
		HTMLInputElement
	> & {
		/** Drag the unit to change the value. Default true. */
		scrub?: boolean;
	};
</script>

<script lang="ts">
	import { clamp } from "#lib/audio/decibels.js";
	import { parseNumber, useParameterSlider } from "./parameter-slider-utils.js";

	/** Alt+arrow and Alt+scrub. */
	const SMALL_STEP = 0.1;
	/** Pixels of scrubbing per step. */
	const PIXEL_SENSITIVITY = 2;

	let {
		ref = $bindable(null),
		scrub = true,
		class: className,
		oninput,
		onblur,
		onkeydown,
		...restProps
	}: ParameterSliderInputProps = $props();

	const slider = useParameterSlider("ParameterSliderInput");

	const formatter = $derived(
		new Intl.NumberFormat(undefined, {
			maximumFractionDigits: slider.decimals,
			minimumFractionDigits: slider.decimals,
		})
	);

	/** Text being typed; null shows the formatted value. */
	let draft = $state<string | null>(null);
	const text = $derived(draft ?? formatter.format(slider.value));

	/** Clamps to the range and rounds to the shown digits. */
	const validate = (next: number) => {
		const factor = 10 ** slider.decimals;
		return clamp(Math.round(next * factor) / factor, slider.min, slider.max);
	};

	const stepFor = (event: { altKey: boolean; shiftKey: boolean }) => {
		if (event.altKey) {
			return SMALL_STEP;
		}
		return event.shiftKey ? slider.largeStep : slider.step;
	};

	const setValue = (next: number, event: Event) => {
		slider.change(next, { event, reason: "input" });
	};

	const commitDraft = (event: Event) => {
		if (draft === null) {
			return;
		}
		const parsed = parseNumber(draft);
		draft = null;
		if (parsed === null) {
			return;
		}
		const next = validate(parsed);
		setValue(next, event);
		slider.commit(next);
	};

	const handleInput: ParameterSliderInputProps["oninput"] = (event) => {
		oninput?.(event);
		draft = event.currentTarget.value;
		const parsed = parseNumber(draft);
		if (parsed !== null) {
			setValue(validate(parsed), event);
		}
	};

	const handleBlur: ParameterSliderInputProps["onblur"] = (event) => {
		onblur?.(event);
		commitDraft(event);
	};

	const handleKeyDown: ParameterSliderInputProps["onkeydown"] = (event) => {
		onkeydown?.(event);
		if (event.defaultPrevented || slider.disabled) {
			return;
		}
		if (event.key === "Enter") {
			commitDraft(event);
			return;
		}
		const amount = stepFor(event);
		const targets: Record<string, () => number> = {
			ArrowDown: () => slider.value - amount,
			ArrowUp: () => slider.value + amount,
			End: () => slider.max,
			Home: () => slider.min,
			PageDown: () => slider.value - slider.largeStep,
			PageUp: () => slider.value + slider.largeStep,
		};
		const target = targets[event.key];
		if (!target) {
			return;
		}
		event.preventDefault();
		draft = null;
		const next = validate(target());
		setValue(next, event);
		slider.commit(next);
	};

	/** The scrub in progress: the last pointer x and the pixels not yet turned into steps. */
	let scrubbing: { x: number; remainder: number } | null = null;

	const handleScrubDown = (event: PointerEvent & { currentTarget: HTMLSpanElement }) => {
		if (event.button !== 0 || slider.disabled) {
			return;
		}
		event.preventDefault();
		event.currentTarget.setPointerCapture?.(event.pointerId);
		draft = null;
		scrubbing = { remainder: 0, x: event.clientX };
	};

	const handleScrubMove = (event: PointerEvent) => {
		if (!scrubbing) {
			return;
		}
		const pixels = scrubbing.remainder + event.clientX - scrubbing.x;
		const steps = Math.trunc(pixels / PIXEL_SENSITIVITY);
		scrubbing = { remainder: pixels - steps * PIXEL_SENSITIVITY, x: event.clientX };
		if (steps !== 0) {
			setValue(validate(slider.value + steps * stepFor(event)), event);
		}
	};

	const handleScrubEnd = () => {
		if (scrubbing) {
			scrubbing = null;
			slider.commit(slider.value);
		}
	};
</script>

<div class="shrink-0">
	<div
		data-slot="parameter-slider-input-group"
		class="flex h-7 items-center rounded-lg bg-input/50 focus-within:ring-3 focus-within:ring-ring/30"
	>
		<input
			bind:this={ref}
			type="text"
			inputmode={slider.decimals > 0 ? "decimal" : "numeric"}
			autocomplete="off"
			autocorrect="off"
			spellcheck="false"
			aria-roledescription="Number field"
			aria-labelledby={slider.labelId}
			data-slot="parameter-slider-input"
			class={cn(
				"h-full w-16 bg-transparent px-2 text-end font-mono text-xs tabular-nums outline-hidden",
				className
			)}
			disabled={slider.disabled}
			value={text}
			oninput={handleInput}
			onblur={handleBlur}
			onkeydown={handleKeyDown}
			{...restProps}
		/>
		{#if slider.unit}
			{#if scrub}
				<span
					role="presentation"
					class="cursor-ew-resize"
					onpointerdown={handleScrubDown}
					onpointermove={handleScrubMove}
					onpointerup={handleScrubEnd}
					onpointercancel={handleScrubEnd}
				>
					{@render suffix(slider.unit)}
				</span>
			{:else}
				{@render suffix(slider.unit)}
			{/if}
		{/if}
	</div>
</div>

{#snippet suffix(unit: string)}
	<span class="px-1.5 text-xs text-muted-foreground" data-slot="parameter-slider-unit">
		{unit}
	</span>
{/snippet}
