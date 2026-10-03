<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { clamp } from "#lib/audio/decibels.js";
	import type { FrameSource } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type SoundPadProgressProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** 0..1, for declarative use. */
		value?: number;
		/** A smooth progress source with no Svelte updates. */
		source?: FrameSource<number> | null;
		/** Default `bar`. */
		variant?: "bar" | "fill" | "ring";
	};
</script>

<script lang="ts">
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { getSoundPadContext } from "./sound-pad-context.svelte.js";

	let {
		ref = $bindable(null),
		value,
		source,
		variant = "bar",
		class: className,
		style,
		...restProps
	}: SoundPadProgressProps = $props();

	const pad = getSoundPadContext();

	useFrameSource(
		() => source,
		(next) => {
			ref?.style.setProperty("--pad-progress", clamp(next, 0, 1).toFixed(4));
		}
	);

	// A declarative value, or 0 once playback stops. While a source plays it
	// stays undefined, so Svelte leaves the source's per-frame writes alone.
	const progress = $derived.by(() => {
		if (value !== undefined) {
			return clamp(value, 0, 1).toFixed(4);
		}
		if (!pad.playing) {
			return "0";
		}
		return undefined;
	});
	const progressStyle = $derived(
		progress === undefined ? style : `--pad-progress:${progress};${style ?? ""}`
	);
</script>

{#if variant === "ring"}
	<div
		bind:this={ref}
		aria-hidden="true"
		data-slot="sound-pad-progress"
		data-variant={variant}
		style={progressStyle}
		class={cn("pointer-events-none absolute right-2 bottom-2 size-5 [--pad-progress:0]", className)}
		{...restProps}
	>
		<div
			class="size-full rounded-full bg-[conic-gradient(var(--pad-accent)_calc(var(--pad-progress)*360deg),color-mix(in_oklch,var(--pad-accent)_20%,transparent)_0)] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),black_calc(100%-3px))]"
		></div>
	</div>
{:else}
	<div
		bind:this={ref}
		aria-hidden="true"
		data-slot="sound-pad-progress"
		data-variant={variant}
		style={progressStyle}
		class={cn(
			"pointer-events-none absolute inset-x-0 bottom-0 [--pad-progress:0]",
			variant === "fill" ? "top-0" : "h-1",
			className
		)}
		{...restProps}
	>
		<div
			class={cn(
				"size-full origin-left scale-x-(--pad-progress) bg-(--pad-accent)",
				variant === "fill" && "opacity-20"
			)}
		></div>
	</div>
{/if}
