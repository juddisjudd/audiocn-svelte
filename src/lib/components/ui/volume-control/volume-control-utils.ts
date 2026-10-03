import { getContext, setContext } from "svelte";

import type { Orientation } from "#lib/audio/types.js";

export const PERCENT = 100;
const LOW_LEVEL = 0.34;
const MEDIUM_LEVEL = 0.67;
const PERCEPTUAL_EXPONENT = 2;

export type VolumeLevel = "muted" | "low" | "medium" | "high";

export type VolumeCurve = "linear" | "perceptual";

/** Maps a volume (0..1 gain) to a slider position and back. */
export const curves = {
	linear: {
		toPosition: (volume: number) => volume,
		toVolume: (position: number) => position,
	},
	perceptual: {
		toPosition: (volume: number) => volume ** (1 / PERCEPTUAL_EXPONENT),
		toVolume: (position: number) => position ** PERCEPTUAL_EXPONENT,
	},
} as const;

export const levelFor = (volume: number, muted: boolean): VolumeLevel => {
	if (muted || volume <= 0) {
		return "muted";
	}
	if (volume < LOW_LEVEL) {
		return "low";
	}
	if (volume < MEDIUM_LEVEL) {
		return "medium";
	}
	return "high";
};

export interface VolumeControlContext {
	readonly volume: number;
	readonly muted: boolean;
	readonly level: VolumeLevel;
	readonly position: number;
	readonly step: number;
	readonly orientation: Orientation;
	readonly disabled: boolean;
	setPosition: (position: number) => void;
	commit: () => void;
	toggleMuted: () => void;
}

const VOLUME_CONTROL_KEY = Symbol("audiocn.volume-control");

export const setVolumeControl = (context: VolumeControlContext): VolumeControlContext =>
	setContext(VOLUME_CONTROL_KEY, context);

export const useVolumeControl = (part: string): VolumeControlContext => {
	const context = getContext<VolumeControlContext | undefined>(VOLUME_CONTROL_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside VolumeControl.`);
	}
	return context;
};

/** Rounds to the nearest step from `min`, at the step's precision. */
export const roundToStep = (value: number, step: number, min: number) => {
	const nearest = Math.round((value - min) / step) * step + min;
	const text = String(step);
	const dot = text.indexOf(".");
	return Number(nearest.toFixed(dot === -1 ? 0 : text.length - dot - 1));
};

export const POSITION_STEP = 0.0005;
const POSITION_DECIMALS = 4;

/**
 * A position on bits-ui's step grid, so the slider never snaps it and reports
 * a change nobody made.
 */
export const snapPosition = (position: number) => {
	const index = Math.round(Math.min(1, Math.max(0, position)) / POSITION_STEP);
	const factor = 10 ** POSITION_DECIMALS;
	return Math.round(index * POSITION_STEP * factor) / factor;
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
