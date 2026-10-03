import { getContext, setContext } from "svelte";

import { formatDb, SILENCE_DB } from "#lib/audio/decibels.js";
import type { Orientation, Taper } from "#lib/audio/types.js";
import type { AudioSize } from "#lib/hooks/use-audio-config.svelte.js";

export const DEFAULT_MIN_DB = -60;
export const DEFAULT_MAX_DB = 6;
export const POSITION_STEP = 0.0005;
export const DETENT_SNAP = 0.012;
const POSITION_DECIMALS = 4;
const PRECISION = 1e6;
export const DEFAULT_DETENTS = [0];
const DB_SUFFIX = /db/iu;
const INFINITY_TEXT = /^-?(?:inf|infinity|∞)$/iu;

export type FaderChangeReason = "drag" | "track-press" | "keyboard" | "wheel" | "reset" | "input";

export interface FaderChangeDetails {
	reason: FaderChangeReason;
	event?: Event;
}

export type FaderVariant = "default" | "console";

export interface FaderContext {
	readonly ariaLabel: string | undefined;
	readonly ariaLabelledBy: string | undefined;
	/** The current value; event handlers read it as the latest one. */
	readonly value: number;
	readonly position: number;
	readonly originPosition: number;
	readonly min: number;
	readonly max: number;
	readonly resetValue: number;
	readonly orientation: Orientation;
	readonly variant: FaderVariant;
	readonly size: AudioSize;
	readonly disabled: boolean;
	readonly taper: Taper;
	readonly dragging: boolean;
	setDragging: (dragging: boolean) => void;
	/** FaderLabel reports its id, so the thumb is labelled by it. */
	registerLabel: (id: string) => () => void;
	/** Moves focus to the thumb, as a click on FaderLabel does. */
	focusThumb: () => void;
	format: (db: number) => string;
	/** The value in dB for a thumb position, with detents and quantizing. */
	fromPosition: (position: number, fine: boolean) => number;
	change: (db: number, details: FaderChangeDetails) => void;
	commit: (db: number) => void;
	handleKeyDown: (event: KeyboardEvent) => void;
}

const FADER_KEY = Symbol("audiocn.fader");

export const setFader = (context: FaderContext): FaderContext => setContext(FADER_KEY, context);

export const useFader = (part: string): FaderContext => {
	const context = getContext<FaderContext | undefined>(FADER_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside Fader.`);
	}
	return context;
};

export const defaultFormat = (db: number) => (db === SILENCE_DB ? "Silent" : formatDb(db));

export const roundValue = (value: number) => Math.round(value * PRECISION) / PRECISION;

/**
 * A position on bits-ui's step grid, so the slider never snaps it and reports
 * a change nobody made.
 */
export const snapPosition = (position: number) => {
	const index = Math.round(Math.min(1, Math.max(0, position)) / POSITION_STEP);
	const factor = 10 ** POSITION_DECIMALS;
	return Math.round(index * POSITION_STEP * factor) / factor;
};

/** Centres the thumb on the track at a position, on both axes. */
export const thumbStyle = (position: number, orientation: Orientation) => {
	const percent = position * 100;
	return orientation === "vertical"
		? `position: absolute; bottom: ${percent}%; left: 50%; translate: -50% 50%;`
		: `position: absolute; left: ${percent}%; top: 50%; translate: -50% -50%;`;
};

/** Where a pointer is along a track, 0..1, or null when the track has no size. */
export const pointerPosition = (
	event: PointerEvent,
	track: HTMLElement | null,
	orientation: Orientation
): number | null => {
	const rect = track?.getBoundingClientRect();
	if (!rect) {
		return null;
	}
	const size = orientation === "vertical" ? rect.height : rect.width;
	if (!(size > 0)) {
		return null;
	}
	const offset =
		orientation === "vertical" ? rect.bottom - event.clientY : event.clientX - rect.left;
	return Math.min(1, Math.max(0, offset / size));
};

export const parseDb = (text: string): number | null => {
	const normalized = text.replaceAll("−", "-").replace(DB_SUFFIX, "").trim();
	if (INFINITY_TEXT.test(normalized)) {
		return SILENCE_DB;
	}
	if (normalized === "") {
		return null;
	}
	const parsed = Number(normalized);
	return Number.isNaN(parsed) ? null : parsed;
};

/** Levels whose text is as wide as any a fader shows: two digits either side of 0. */
const WIDTH_SAMPLES_DB = [-88.8, -8.8, 8.8, 88.8];

/** Characters in the widest value this fader can show. */
export const widestValue = (format: (db: number) => string, min: number, max: number) =>
	Math.max(
		...[
			SILENCE_DB,
			min,
			min + 0.1,
			max,
			max - 0.1,
			...WIDTH_SAMPLES_DB.filter((db) => db > min && db < max),
		].map((db) => format(db).length)
	);
