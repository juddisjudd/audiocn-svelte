<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { HTMLAttributes } from "svelte/elements";
	import type { BallisticsInput } from "#lib/audio/ballistics.js";
	import type { TaperInput } from "#lib/audio/taper.js";
	import type {
		ChannelLevel,
		FrameSource,
		MeterFrame,
		MeterZone,
		Orientation,
	} from "#lib/audio/types.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { LevelMeterVariant } from "./level-meter-utils.js";

	export const levelMeterVariants = tv({
		// Animated bars and peak markers must not become the page's scroll anchor.
		base: "group/level-meter flex gap-2 [--meter-gap:0.25rem] [overflow-anchor:none] data-dimmed:opacity-50",
		variants: {
			orientation: {
				horizontal:
					"w-full flex-row items-center [--meter-scale-size:1rem] has-[[data-slot=db-scale]]:pb-[calc(var(--meter-scale-size)+var(--meter-gap))]",
				vertical: "min-h-32 flex-col items-center",
			},
			size: {
				default: "[--meter-thickness:0.5rem]",
				lg: "[--meter-thickness:0.75rem]",
				sm: "[--meter-thickness:0.25rem]",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
			size: "default",
		},
	});

	export type LevelMeterSize = VariantProps<typeof levelMeterVariants>["size"];

	export interface LevelMeterActions {
		/** Paint a frame directly, for callers that own their own frame loop. */
		paint: (frame: MeterFrame) => void;
		/** Drop the level and the peak hold to silence. */
		reset: () => void;
	}

	export type LevelMeterProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		/** A meter source; the meter subscribes and paints itself without reactive updates. */
		source?: FrameSource<MeterFrame> | null;
		/** Mono peak level in dBFS, for declarative use. */
		peakDb?: number;
		/** Mono RMS level in dBFS, for declarative use. */
		rmsDb?: number;
		/** Levels per channel, for declarative multi-channel use. */
		channels?: ChannelLevel[];
		/** Tracks to render before data arrives. Default 1. */
		channelCount?: number;
		/** Bottom of the displayed range. Default −60. */
		minDb?: number;
		/** Top of the displayed range. Default 0. */
		maxDb?: number;
		/** Colour zones. Default ok / warn from −20 / clip from −9. */
		zones?: MeterZone[];
		/** How the meter moves. Default `peak`. */
		ballistics?: BallisticsInput;
		/** Scale law. Default `linear`. */
		taper?: TaperInput;
		orientation?: Orientation;
		/** `segmented` is an LED ladder. Default `solid`. */
		variant?: LevelMeterVariant;
		/** Segments for the `segmented` variant. Default 24. */
		segments?: number;
		size?: LevelMeterSize;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { resolveBallistics } from "#lib/audio/ballistics.js";
	import { DEFAULT_MAX_DB, DEFAULT_MIN_DB } from "#lib/audio/decibels.js";
	import { createFrameTask } from "#lib/audio/frame-loop.js";
	import { createFrameEmitter } from "#lib/audio/frame-source.js";
	import { resolveTaper } from "#lib/audio/taper.js";
	import { DEFAULT_ZONES } from "#lib/audio/zones.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";
	import LevelMeterBar from "./level-meter-bar.svelte";
	import LevelMeterChannel from "./level-meter-channel.svelte";
	import LevelMeterChannels from "./level-meter-channels.svelte";
	import LevelMeterHold from "./level-meter-hold.svelte";
	import LevelMeterTrack from "./level-meter-track.svelte";
	import {
		buildSegmentMask,
		buildZoneFill,
		createMeterPainter,
		parseLevels,
		serializeLevels,
		setLevelMeterContext,
		type MeterPainter,
		type MeterScale,
	} from "./level-meter-utils.js";

	const DEFAULT_SEGMENTS = 24;

	const noop = () => {
		// Nothing to wake before the painter starts.
	};

	let {
		ref = $bindable(null),
		source,
		peakDb,
		rmsDb,
		channels,
		channelCount: channelCountProp,
		minDb: minDbProp,
		maxDb: maxDbProp,
		zones: zonesProp,
		ballistics: ballisticsProp,
		taper = "linear",
		orientation: orientationProp,
		variant = "solid",
		segments = DEFAULT_SEGMENTS,
		size: sizeProp,
		class: className,
		style,
		children,
		...restProps
	}: LevelMeterProps = $props();

	// Explicit props win over the surrounding mixer or strip.
	const config = useAudioConfig();
	const ballistics = $derived(ballisticsProp ?? config.ballistics ?? "peak");
	const dimmed = $derived(config.dimmed ?? false);
	const maxDb = $derived(maxDbProp ?? config.maxDb ?? DEFAULT_MAX_DB);
	const minDb = $derived(minDbProp ?? config.minDb ?? DEFAULT_MIN_DB);
	const orientation = $derived(orientationProp ?? config.orientation ?? "horizontal");
	const size = $derived(sizeProp ?? config.size ?? "default");
	const zones = $derived(zonesProp ?? config.zones ?? DEFAULT_ZONES);

	const reducedMotion = useReducedMotion();
	const frames = createFrameEmitter<MeterFrame>();
	let latest: MeterFrame | null = null;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- read by the painter every frame, off the reactive graph
	const channelElements = new Map<number, HTMLElement>();
	// Wakes the painter when something changed. A settled meter sleeps.
	let wake: () => void = noop;
	let painter: MeterPainter | null = null;
	const visible = useVisibility(
		() => ref,
		(isVisible) => {
			if (isVisible) {
				wake();
			}
		}
	);
	let observedCount = $state<number | null>(null);

	const accept = (frame: MeterFrame) => {
		latest = frame;
		frames.emit(frame);
		wake();
	};

	const acceptAndCount = (frame: MeterFrame) => {
		accept(frame);
		const count = frame.channels.length;
		if (count > 0 && untrack(() => observedCount) !== count) {
			observedCount = count;
		}
	};

	useFrameSource(() => source, acceptAndCount);

	const declarativeKey = $derived(serializeLevels(channels, peakDb, rmsDb));
	const channelCount = $derived.by(() => {
		if (channels) {
			return channels.length;
		}
		if (declarativeKey !== "") {
			return 1;
		}
		return observedCount ?? channelCountProp ?? 1;
	});
	const channelIndexes = $derived(Array.from({ length: channelCount }, (_, index) => index));
	const declared = $derived(source ? null : parseLevels(declarativeKey));

	$effect(() => {
		const frame = parseLevels(declarativeKey);
		if (frame) {
			untrack(() => accept(frame));
		}
	});

	const resolvedTaper = $derived(resolveTaper(taper, minDb, maxDb));

	const registerChannel = (index: number, element: HTMLElement | null) => {
		if (element) {
			channelElements.set(index, element);
		} else {
			channelElements.delete(index);
		}
		wake();
	};

	const ballisticsKey = $derived(
		JSON.stringify(typeof ballistics === "string" ? ballistics : resolveBallistics(ballistics))
	);

	// Scale changes (an inline zones array, a new range) reach the painter on
	// its next frame instead of rebuilding it and resetting the ballistics.
	const scale: MeterScale = $derived({ maxDb, minDb, taper: resolvedTaper, zones });

	$effect(() => {
		const created = createMeterPainter({
			ballistics: JSON.parse(ballisticsKey) as BallisticsInput,
			channels: channelElements,
			latest: () => latest,
			reducedMotion: reducedMotion.current,
			root: () => ref,
			scale: untrack(() => scale),
			visible,
		});
		const task = createFrameTask(created.paint);
		painter = created;
		wake = task.wake;
		return () => {
			painter = null;
			wake = noop;
			task.stop();
		};
	});

	// A new range or zones array reaches the painter, and repaints a meter that
	// had settled.
	$effect(() => {
		const next = scale;
		untrack(() => {
			painter?.setScale(next);
			wake();
		});
	});

	export function paint(frame: MeterFrame) {
		acceptAndCount(frame);
	}

	export function reset() {
		accept({ channels: [] });
	}

	const zoneFill = $derived(buildZoneFill(zones, resolvedTaper, orientation, variant));
	const segmentMask = $derived(
		variant === "segmented" ? buildSegmentMask(orientation, segments) : "none"
	);

	setLevelMeterContext({
		get declared() {
			return declared;
		},
		frames,
		get maxDb() {
			return maxDb;
		},
		get minDb() {
			return minDb;
		},
		get orientation() {
			return orientation;
		},
		registerChannel,
		get taper() {
			return resolvedTaper;
		},
		get variant() {
			return variant;
		},
	});
</script>

<div
	bind:this={ref}
	role="meter"
	aria-valuemax={maxDb}
	aria-valuemin={minDb}
	aria-valuenow={minDb}
	data-dimmed={dimmed ? "" : undefined}
	data-orientation={orientation}
	data-size={size}
	data-slot="level-meter"
	data-variant={variant}
	class={cn(levelMeterVariants({ orientation, size }), className)}
	style={`--meter-fill: ${zoneFill}; --meter-mask: ${segmentMask};${style ? ` ${style}` : ""}`}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<LevelMeterChannels>
			{#each channelIndexes as index (index)}
				<LevelMeterChannel {index}>
					<LevelMeterTrack>
						<LevelMeterBar />
						<LevelMeterHold />
					</LevelMeterTrack>
				</LevelMeterChannel>
			{/each}
		</LevelMeterChannels>
	{/if}
</div>
