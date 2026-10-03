<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { TaperInput } from "#lib/audio/taper.js";
	import type { Orientation } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type DbScaleProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		/** Bottom of the range. Default −60, or the surrounding meter's range. */
		minDb?: number;
		/** Top of the range. Default 0, or the surrounding meter's range. */
		maxDb?: number;
		/** Tick values. Default: common values inside the range. */
		ticks?: number[];
		/** Position law, so ticks line up with a fader or meter using the same taper. */
		taper?: TaperInput;
		orientation?: Orientation;
		/** Which side of the tick marks the labels sit on. Default `end`. */
		side?: "start" | "end";
		/** Show labels. Default true. */
		labels?: boolean;
		format?: (db: number) => string;
	};
</script>

<script lang="ts">
	import { DEFAULT_MAX_DB, DEFAULT_MIN_DB, formatDb } from "#lib/audio/decibels.js";
	import { resolveTaper } from "#lib/audio/taper.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import DbScaleTick from "./db-scale-tick.svelte";
	import { setDbScaleContext, thinDbScaleLabels } from "./db-scale-utils.js";

	const DEFAULT_TICKS = [12, 6, 0, -6, -12, -18, -24, -36, -48, -60, -72, -90];

	const defaultFormat = (db: number) => formatDb(db, { decimals: 0, unit: false });

	let {
		ref = $bindable(null),
		minDb: minDbProp,
		maxDb: maxDbProp,
		ticks,
		taper = "linear",
		orientation: orientationProp,
		side = "end",
		labels = true,
		format = defaultFormat,
		class: className,
		children,
		...restProps
	}: DbScaleProps = $props();

	const config = useAudioConfig();
	const minDb = $derived(minDbProp ?? config.minDb ?? DEFAULT_MIN_DB);
	const maxDb = $derived(maxDbProp ?? config.maxDb ?? DEFAULT_MAX_DB);
	const orientation = $derived(orientationProp ?? config.orientation ?? "horizontal");
	const resolvedTaper = $derived(resolveTaper(taper, minDb, maxDb));
	const values = $derived(ticks ?? DEFAULT_TICKS.filter((tick) => tick >= minDb && tick <= maxDb));

	setDbScaleContext({
		get format() {
			return format;
		},
		get labels() {
			return labels;
		},
		get orientation() {
			return orientation;
		},
		get side() {
			return side;
		},
		get taper() {
			return resolvedTaper;
		},
	});

	// Re-check label collisions when the scale resizes or its ticks change.
	$effect(() => {
		const scale = ref;
		if (!(scale && labels)) {
			return;
		}
		let cancelled = false;
		const thin = () => thinDbScaleLabels(scale);
		thin();
		const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(thin);
		resize?.observe(scale);
		// Only style changes: hiding a label must not trigger another pass.
		const ticksChanged = new MutationObserver(thin);
		ticksChanged.observe(scale, {
			attributeFilter: ["style"],
			characterData: true,
			childList: true,
			subtree: true,
		});
		const afterFonts = async () => {
			await document.fonts?.ready;
			if (!cancelled) {
				thin();
			}
		};
		afterFonts();
		return () => {
			cancelled = true;
			resize?.disconnect();
			ticksChanged.disconnect();
		};
	});
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	data-orientation={orientation}
	data-side={side}
	data-slot="db-scale"
	class={cn(
		"relative shrink-0 text-[0.625rem] leading-none text-muted-foreground tabular-nums select-none",
		orientation === "horizontal" ? "h-4 w-full" : "h-full w-7",
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{#each values as tick (tick)}
			<DbScaleTick value={tick} />
		{/each}
	{/if}
</div>
