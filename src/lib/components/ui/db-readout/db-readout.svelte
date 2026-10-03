<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { SILENCE_DB } from "#lib/audio/decibels.js";
	import type { FrameSource, MeterFrame, MeterZone } from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type DbReadoutProps = WithElementRef<
		Omit<HTMLAttributes<HTMLSpanElement>, "children">,
		HTMLSpanElement
	> & {
		/** A level in dB, for declarative use. */
		value?: number;
		/** A meter source; the readout updates itself without reactive updates. */
		source?: FrameSource<MeterFrame> | null;
		/** Which measurement to show. Default `peak`. */
		measure?: "peak" | "rms";
		/** A channel index, or `max` for the loudest channel. Default `max`. */
		channel?: number | "max";
		/** How often the text changes. Default 250 ms. */
		intervalMs?: number;
		/** Show the highest value seen within this window. Default 0. */
		holdMs?: number;
		/** Digits after the decimal point. Default 1. */
		decimals?: number;
		/** Append " dB". Default true. */
		unit?: boolean;
		/** At or below this level, show "−∞". Default −60. */
		floorDb?: number;
		/** Zones used for `data-zone`. */
		zones?: MeterZone[];
		/** Replaces all formatting. */
		format?: (db: number) => string;
	};

	/** The level a readout shows from one frame. */
	export const readChannel = (
		frame: MeterFrame,
		measure: "peak" | "rms",
		channel: number | "max"
	) => {
		const read = (index: number) => {
			const level = frame.channels[index];
			if (!level) {
				return SILENCE_DB;
			}
			return measure === "rms" ? (level.rmsDb ?? level.peakDb) : level.peakDb;
		};
		if (channel !== "max") {
			return read(channel);
		}
		let loudest = SILENCE_DB;
		for (let index = 0; index < frame.channels.length; index += 1) {
			loudest = Math.max(loudest, read(index));
		}
		return loudest;
	};

	const noop = () => {
		// Nothing to wake before the ticker starts.
	};

	/**
	 * An interval that stops itself once `step` reports nothing left to do, and
	 * that `wake` starts again: a readout whose source went quiet costs no timer.
	 */
	const createTicker = (step: () => boolean, intervalMs: number) => {
		let timer: ReturnType<typeof setInterval> | null = null;
		const stop = () => {
			if (timer !== null) {
				clearInterval(timer);
				timer = null;
			}
		};
		const wake = () => {
			if (timer === null) {
				timer = setInterval(() => {
					if (!step()) {
						stop();
					}
				}, intervalMs);
			}
		};
		return { stop, wake };
	};
</script>

<script lang="ts">
	import { formatDb } from "#lib/audio/decibels.js";
	import { DEFAULT_ZONES, zoneForDb } from "#lib/audio/zones.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";

	const DEFAULT_INTERVAL_MS = 250;
	const DEFAULT_FLOOR_DB = -60;
	/** Two-digit levels, the widest a meter usually shows, on either side of 0. */
	const WIDEST_MAGNITUDE_DB = 88.8;

	let {
		ref = $bindable(null),
		value,
		source,
		measure = "peak",
		channel = "max",
		intervalMs = DEFAULT_INTERVAL_MS,
		holdMs = 0,
		decimals = 1,
		unit = true,
		floorDb = DEFAULT_FLOOR_DB,
		zones = DEFAULT_ZONES,
		format,
		class: className,
		style,
		...restProps
	}: DbReadoutProps = $props();

	let peak = SILENCE_DB;
	let peakAt = 0;
	let shown: string | null = null;
	// Frames since the last tick, and the wake for a ticker that went quiet.
	let fresh = false;
	let wake: () => void = noop;

	const render = (db: number) => (format ? format(db) : formatDb(db, { decimals, floorDb, unit }));

	const initialDb = $derived(value ?? SILENCE_DB);
	// Size for the widest text the readout can show, so it never changes width.
	// Values at or below the floor read as −∞, so measure just above it too.
	const widest = $derived.by(() => {
		const justAboveFloor = Number.isFinite(floorDb)
			? floorDb + 10 ** -decimals
			: -WIDEST_MAGNITUDE_DB;
		return Math.max(
			...[SILENCE_DB, justAboveFloor, -WIDEST_MAGNITUDE_DB, WIDEST_MAGNITUDE_DB].map(
				(db) => render(db).length
			)
		);
	});

	useFrameSource(
		() => source,
		(frame) => {
			const db = readChannel(frame, measure, channel);
			const now = performance.now();
			if (db >= peak || now - peakAt > holdMs) {
				peak = db;
				peakAt = now;
			}
			fresh = true;
			wake();
		}
	);

	// Reads the latest props on each tick, so an inline format or zones array
	// doesn't restart the timer. Returns whether the ticker still has work: a
	// quiet source whose readout stopped changing lets it stop, and the next
	// frame starts it again.
	const tick = (): boolean => {
		const element = ref;
		if (!element) {
			return false;
		}
		const db = peak;
		const text = render(db);
		const changed = text !== shown;
		if (changed) {
			shown = text;
			if (element.firstChild) {
				element.firstChild.nodeValue = text;
			} else {
				element.textContent = text;
			}
			element.dataset.zone = zoneForDb(db, zones);
			element.toggleAttribute("data-silent", db <= floorDb);
		}
		// Without a hold, a source that stops sending frames falls to −∞.
		if (holdMs === 0) {
			peak = SILENCE_DB;
		}
		const wasFresh = fresh;
		fresh = false;
		return changed || wasFresh;
	};

	$effect(() => {
		if (!source) {
			return;
		}
		// The first tick always writes, whatever the span shows now.
		shown = null;
		const ticker = createTicker(tick, intervalMs);
		wake = ticker.wake;
		ticker.wake();
		return () => {
			wake = noop;
			ticker.stop();
		};
	});
</script>

<!--
	The ticker writes text Svelte does not know about. Switching between a
	source and a value swaps the span, so a value never shows the last live
	level and a returning source starts from a fresh first paint.
-->
{#key source ? "source" : "value"}
	<span
		bind:this={ref}
		data-silent={initialDb <= floorDb ? "" : undefined}
		data-slot="db-readout"
		data-zone={zoneForDb(initialDb, zones)}
		class={cn("inline-block min-w-(--db-readout-width) text-end font-mono tabular-nums", className)}
		style={`--db-readout-width: ${widest}ch;${style ? ` ${style}` : ""}`}
		{...restProps}
	>
		{render(initialDb)}
	</span>
{/key}
