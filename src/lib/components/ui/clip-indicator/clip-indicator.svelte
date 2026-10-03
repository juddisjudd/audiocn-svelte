<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { SILENCE_DB } from "#lib/audio/decibels.js";
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export interface ClipIndicatorActions {
		/** Feed a level reading. */
		report: (db: number) => void;
		/** Turn the light off and clear the count. */
		reset: () => void;
	}

	export type ClipIndicatorProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		/** Controlled clip state. When set, the component does no detection. */
		clipping?: boolean;
		/** A meter source; the indicator detects clipping itself. */
		source?: FrameSource<MeterFrame> | null;
		/** Levels at or above this count as a clip. Default −1 dBFS. */
		thresholdDb?: number;
		/** How long the light stays on. `Infinity` latches until reset. Default 1500 ms. */
		holdMs?: number;
		onClippingChange?: (clipping: boolean) => void;
		/** Show the number of clips next to the light. Default false. */
		showCount?: boolean;
		/** Renders your own element instead of the button. Spread `props` on it. */
		child?: Snippet<[{ props: Record<string, unknown>; clipping: boolean; count: number }]>;
	};

	const loudestPeak = (frame: MeterFrame) => {
		let loudest = SILENCE_DB;
		for (const level of frame.channels) {
			loudest = Math.max(loudest, level.peakDb);
		}
		return loudest;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import { CLIP_HOLD_MS, CLIP_THRESHOLD_DB } from "#lib/audio/zones.js";
	import { useClipHold } from "#lib/hooks/use-clip-hold.svelte.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";

	let {
		ref = $bindable(null),
		clipping: clippingProp,
		source,
		thresholdDb = CLIP_THRESHOLD_DB,
		holdMs = CLIP_HOLD_MS,
		onClippingChange,
		showCount = false,
		child,
		class: className,
		children,
		...restProps
	}: ClipIndicatorProps = $props();

	const hold = useClipHold(() => ({ holdMs, onClippingChange, thresholdDb }));
	const clipping = $derived(clippingProp ?? hold.clipping);

	useFrameSource(
		() => source,
		(frame) => {
			hold.report(loudestPeak(frame));
		}
	);

	export function report(db: number) {
		hold.report(db);
	}

	export function reset() {
		hold.reset();
	}

	const mergedProps = $derived(
		mergeProps(
			{
				"aria-label": clipping ? "Clipping. Reset clip indicator" : "Clip indicator",
				"data-clipping": clipping ? "" : undefined,
				"data-slot": "clip-indicator",
				class: cn(
					"group/clip-indicator text-muted-foreground hover:bg-muted focus-visible:ring-ring/30 data-clipping:text-meter-clip-foreground relative inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-full px-1 text-xs font-medium transition-colors outline-none after:absolute after:-inset-1 focus-visible:ring-3 pointer-coarse:after:-inset-2.5",
					className
				),
				onclick: () => {
					hold.reset();
				},
				type: "button" as const,
			},
			restProps
		)
	);
</script>

{#snippet content()}
	{#if children}
		{@render children()}
	{:else}
		<span
			class="size-2 shrink-0 rounded-full bg-muted-foreground/30 transition-colors group-data-clipping/clip-indicator:bg-meter-clip"
			data-slot="clip-indicator-light"
		></span>
	{/if}
	{#if showCount}
		<span class="tabular-nums" data-slot="clip-indicator-count">{hold.count}</span>
	{/if}
	<span aria-live="polite" class="sr-only">{clipping ? "Clipping" : ""}</span>
{/snippet}

{#if child}
	{@render child({ props: mergedProps, clipping, count: hold.count })}
{:else}
	<button bind:this={ref} {...mergedProps}>
		{@render content()}
	</button>
{/if}
