import { getContext, setContext } from "svelte";

import { createBallistics, resolveBallistics } from "#lib/audio/ballistics.js";
import type { Ballistics, BallisticsInput } from "#lib/audio/ballistics.js";
import { formatDb, SILENCE_DB } from "#lib/audio/decibels.js";
import { createPainterClock } from "#lib/audio/frame-loop.js";
import type {
	ChannelLevel,
	FrameSource,
	MeterFrame,
	MeterZone,
	Orientation,
	Taper,
} from "#lib/audio/types.js";
import { CLIP_HOLD_MS, CLIP_THRESHOLD_DB, zoneForDb } from "#lib/audio/zones.js";

const ARIA_INTERVAL_MS = 250;
const REDUCED_MOTION_INTERVAL_MS = 250;
const POSITION_EPSILON = 0.0005;
/**
 * A meter this close to its input has nothing visible left to animate (about
 * 0.06 dB on the default range, under a pixel on any meter), so it sleeps.
 */
const SETTLE_EPSILON = 0.001;

export type LevelMeterVariant = "solid" | "segmented" | "gradient";

export interface LevelMeterContext {
	readonly orientation: Orientation;
	readonly variant: LevelMeterVariant;
	readonly minDb: number;
	readonly maxDb: number;
	readonly taper: Taper;
	readonly frames: FrameSource<MeterFrame>;
	/** The declarative levels, when the meter has values instead of a source. */
	readonly declared: MeterFrame | null;
	registerChannel: (index: number, element: HTMLElement | null) => void;
}

const LEVEL_METER_KEY = Symbol("audiocn.level-meter");

export const setLevelMeterContext = (value: LevelMeterContext): LevelMeterContext =>
	setContext(LEVEL_METER_KEY, value);

export const useLevelMeterContext = (part: string): LevelMeterContext => {
	const context = getContext<LevelMeterContext | undefined>(LEVEL_METER_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside LevelMeter.`);
	}
	return context;
};

/**
 * Zones in rising order, as a new array. An insertion rather than the ES2023
 * sorted-copy method, which projects compiling against ES2022 lack; a meter
 * has a handful of zones.
 */
const byFromDb = (zones: MeterZone[]): MeterZone[] => {
	const sorted: MeterZone[] = [];
	for (const zone of zones) {
		const index = sorted.findIndex((other) => other.fromDb > zone.fromDb);
		if (index === -1) {
			sorted.push(zone);
		} else {
			sorted.splice(index, 0, zone);
		}
	}
	return sorted;
};

export const buildZoneFill = (
	zones: MeterZone[],
	taper: Taper,
	orientation: Orientation,
	variant: LevelMeterVariant
) => {
	const direction = orientation === "horizontal" ? "to right" : "to top";
	const sorted = byFromDb(zones);
	// Rounded so the server and the browser print the same stops.
	const starts = sorted.map((zone) => Number((taper.toPosition(zone.fromDb) * 100).toFixed(3)));

	if (variant === "gradient") {
		const stops = sorted.map((zone, index) => `var(--meter-${zone.zone}) ${starts[index] ?? 0}%`);
		const last = sorted.at(-1);
		return `linear-gradient(${direction}, ${stops.join(", ")}, var(--meter-${last?.zone ?? "ok"}) 100%)`;
	}

	const stops = sorted.map((zone, index) => {
		const start = starts[index] ?? 0;
		const end = starts[index + 1] ?? 100;
		return `var(--meter-${zone.zone}) ${start}% ${end}%`;
	});
	return `linear-gradient(${direction}, ${stops.join(", ")})`;
};

export const buildSegmentMask = (orientation: Orientation, segments: number) => {
	const direction = orientation === "horizontal" ? "to right" : "to top";
	const size = `calc(100% / ${segments})`;
	return `repeating-linear-gradient(${direction}, black 0 calc(${size} - 2px), transparent calc(${size} - 2px) ${size})`;
};

export const serializeLevels = (
	channels: ChannelLevel[] | undefined,
	peakDb: number | undefined,
	rmsDb: number | undefined
): string => {
	if (channels) {
		return channels.map((level) => `${level.peakDb}:${level.rmsDb}`).join("|");
	}
	if (peakDb === undefined && rmsDb === undefined) {
		return "";
	}
	return `${peakDb ?? SILENCE_DB}:${rmsDb}`;
};

const parseNumber = (text: string | undefined): number | undefined => {
	const value = Number(text);
	return Number.isNaN(value) ? undefined : value;
};

export const parseLevels = (key: string): MeterFrame | null => {
	if (key === "") {
		return null;
	}
	return {
		channels: key.split("|").map((entry) => {
			const [peak, rms] = entry.split(":");
			return {
				peakDb: parseNumber(peak) ?? SILENCE_DB,
				rmsDb: parseNumber(rms),
			};
		}),
	};
};

interface ChannelState {
	element: HTMLElement;
	peak: Ballistics;
	rms: Ballistics;
	level: number;
	rmsLevel: number;
	hold: number;
	zone: string;
	/** Null until first painted, so a new painter always writes it. */
	active: boolean | null;
}

/** Handed to the painter when it changes, so it never rebuilds the painter. */
export interface MeterScale {
	maxDb: number;
	minDb: number;
	taper: Taper;
	zones: MeterZone[];
}

export interface PainterOptions {
	ballistics: BallisticsInput;
	channels: Map<number, HTMLElement>;
	latest: () => MeterFrame | null;
	reducedMotion: boolean;
	root: () => HTMLElement | null;
	scale: MeterScale;
	visible: { readonly current: boolean };
}

export interface MeterPainter {
	/** Paints one frame. Returns true while the meter needs another. */
	paint: (frameMs: number) => boolean;
	/** A new range, taper or zones, used from the next frame. */
	setScale: (scale: MeterScale) => void;
}

const silentLevel: ChannelLevel = { peakDb: SILENCE_DB };

const writePosition = (element: HTMLElement, property: string, previous: number, next: number) => {
	if (Math.abs(previous - next) > POSITION_EPSILON) {
		element.style.setProperty(property, next.toFixed(4));
		return next;
	}
	return previous;
};

interface ChannelPaint {
	/** The smoothed peak this frame, in dBFS. */
	db: number;
	/** Level, RMS and hold have all reached the input: nothing left to animate. */
	settled: boolean;
}

/**
 * Paints a meter's channels outside the reactive graph: steps ballistics,
 * writes CSS variables and data attributes, and throttles ARIA updates.
 * Returns true while it needs another frame, so a meter that has settled, or
 * is off screen, stops costing frames until something wakes it.
 */
export const createMeterPainter = (options: PainterOptions): MeterPainter => {
	const ballisticsOptions: BallisticsInput = options.reducedMotion ? "instant" : options.ballistics;
	const states = new Map<number, ChannelState>();
	const clock = createPainterClock();
	let { scale } = options;
	let clipUntil = 0;
	// Null until first painted: a painter rebuilt mid-clip must still clear
	// the attribute the previous one left.
	let clippingShown: boolean | null = null;
	let lastAriaMs = Number.NEGATIVE_INFINITY;
	let ariaShown: string | null = null;
	let rootZoneShown: string | null = null;
	let lastPaintMs = Number.NEGATIVE_INFINITY;

	const stateFor = (index: number, element: HTMLElement) => {
		const existing = states.get(index);
		if (existing && existing.element === element) {
			return existing;
		}
		const created: ChannelState = {
			active: null,
			element,
			hold: -1,
			level: -1,
			peak: createBallistics(ballisticsOptions),
			rms: createBallistics({
				...resolveBallistics(ballisticsOptions),
				peakHoldMs: 0,
			}),
			rmsLevel: -1,
			zone: "",
		};
		states.set(index, created);
		return created;
	};

	const paintChannel = (
		index: number,
		element: HTMLElement,
		input: ChannelLevel,
		nowMs: number
	): ChannelPaint => {
		const state = stateFor(index, element);
		const inputRmsDb = input.rmsDb ?? input.peakDb;
		const peak = state.peak.step(input.peakDb, nowMs);
		const rms = state.rms.step(inputRmsDb, nowMs);
		const { taper } = scale;
		const level = taper.toPosition(peak.db);
		const rmsLevel = taper.toPosition(rms.db);
		const hold = taper.toPosition(peak.holdDb);
		state.level = writePosition(element, "--meter-level", state.level, level);
		state.rmsLevel = writePosition(element, "--meter-rms", state.rmsLevel, rmsLevel);
		state.hold = writePosition(element, "--meter-hold", state.hold, hold);

		const zone = zoneForDb(peak.db, scale.zones);
		if (zone !== state.zone) {
			state.zone = zone;
			element.dataset.zone = zone;
		}
		const active = state.level > 0;
		if (active !== state.active) {
			state.active = active;
			element.toggleAttribute("data-active", active);
		}
		const settled =
			Math.abs(level - taper.toPosition(input.peakDb)) <= SETTLE_EPSILON &&
			Math.abs(rmsLevel - taper.toPosition(inputRmsDb)) <= SETTLE_EPSILON &&
			Math.abs(hold - level) <= SETTLE_EPSILON;
		return { db: peak.db, settled };
	};

	const paintRoot = (root: HTMLElement, loudest: number, nowMs: number, settled: boolean) => {
		const clipping = nowMs < clipUntil;
		if (clipping !== clippingShown) {
			clippingShown = clipping;
			root.toggleAttribute("data-clipping", clipping);
		}
		const text = formatDb(loudest, { floorDb: scale.minDb });
		const zone = zoneForDb(loudest, scale.zones);
		if (text === ariaShown && zone === rootZoneShown) {
			return;
		}
		// Throttled while the level moves; a settled level is written at once,
		// so the value a screen reader finds is never a stale one.
		if (!settled && nowMs - lastAriaMs < ARIA_INTERVAL_MS) {
			return;
		}
		lastAriaMs = nowMs;
		ariaShown = text;
		rootZoneShown = zone;
		const clamped = Math.min(scale.maxDb, Math.max(scale.minDb, loudest));
		root.setAttribute("aria-valuenow", clamped.toFixed(1));
		root.setAttribute("aria-valuetext", text);
		root.dataset.zone = zone;
	};

	const paint = (frameMs: number): boolean => {
		// Hidden: sleep. Coming back into view wakes the painter.
		if (!options.visible.current) {
			return false;
		}
		const nowMs = clock(frameMs);
		if (options.reducedMotion && nowMs - lastPaintMs < REDUCED_MOTION_INTERVAL_MS) {
			return true;
		}
		lastPaintMs = nowMs;
		const frame = options.latest();
		let loudest = SILENCE_DB;
		let settled = true;
		let inputClipping = false;
		for (const [index, element] of options.channels) {
			const input = frame?.channels[index] ?? silentLevel;
			if (input.peakDb >= CLIP_THRESHOLD_DB) {
				clipUntil = nowMs + CLIP_HOLD_MS;
				inputClipping = true;
			}
			const painted = paintChannel(index, element, input, nowMs);
			loudest = Math.max(loudest, painted.db);
			settled &&= painted.settled;
		}
		const root = options.root();
		if (root) {
			paintRoot(root, loudest, nowMs, settled);
		}
		// A clip light counting down after the input dropped needs the frames
		// that turn it off; one held by a still-clipping input does not.
		const releasingClip = nowMs < clipUntil && !inputClipping;
		return !settled || releasingClip;
	};

	return {
		paint,
		setScale: (next) => {
			scale = next;
		},
	};
};
