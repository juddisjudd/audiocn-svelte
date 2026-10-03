import { getContext, setContext } from "svelte";

import type { Taper } from "#lib/audio/types.js";

export const POSITION_STEP = 0.0005;
const POSITION_DECIMALS = 4;
const PRECISION = 1e6;

export type ParameterChangeReason = "drag" | "keyboard" | "input" | "reset";

export interface ParameterChangeDetails {
	reason: ParameterChangeReason;
	event?: Event;
}

export interface ParameterMark {
	value: number;
	label?: string;
}

export interface ParameterSliderContext {
	/** The current value; event handlers read it as the latest one. */
	readonly value: number;
	readonly min: number;
	readonly max: number;
	readonly step: number;
	readonly largeStep: number;
	readonly unit: string | undefined;
	readonly decimals: number;
	readonly resetValue: number;
	readonly position: number;
	readonly originPosition: number;
	readonly taper: Taper;
	readonly disabled: boolean;
	readonly marks: ParameterMark[] | undefined;
	readonly labelId: string;
	readonly descriptionId: string;
	format: (value: number) => string;
	/** Rounds to `step` from `min` and clamps to the range. */
	quantize: (value: number) => number;
	change: (value: number, details: ParameterChangeDetails) => void;
	commit: (value: number) => void;
	handleKeyDown: (event: KeyboardEvent) => void;
}

const PARAMETER_SLIDER_KEY = Symbol("audiocn.parameter-slider");

export const setParameterSlider = (context: ParameterSliderContext): ParameterSliderContext =>
	setContext(PARAMETER_SLIDER_KEY, context);

export const useParameterSlider = (part: string): ParameterSliderContext => {
	const context = getContext<ParameterSliderContext | undefined>(PARAMETER_SLIDER_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside ParameterSlider.`);
	}
	return context;
};

export const decimalsOf = (step: number) => {
	const text = String(step);
	const dot = text.indexOf(".");
	return dot === -1 ? 0 : text.length - dot - 1;
};

export const roundValue = (value: number) => Math.round(value * PRECISION) / PRECISION;

/** Points along the range sampled to find the widest value text. */
const WIDTH_SAMPLES = 24;

/** Characters in the widest value along the range, so the value keeps one width. */
export const widestValue = (
	format: (value: number) => string,
	taper: Taper,
	snap: (value: number) => number
) => {
	let widest = 0;
	for (let index = 0; index <= WIDTH_SAMPLES; index += 1) {
		const sample = snap(taper.toValue(index / WIDTH_SAMPLES));
		widest = Math.max(widest, format(sample).length);
	}
	return widest;
};

/**
 * A position on bits-ui's step grid, so the slider never snaps it and reports
 * a change nobody made.
 */
export const snapPosition = (position: number) => {
	const index = Math.round(Math.min(1, Math.max(0, position)) / POSITION_STEP);
	const factor = 10 ** POSITION_DECIMALS;
	return Math.round(index * POSITION_STEP * factor) / factor;
};

/** Where a pointer is along a horizontal track, 0..1, or null when it has no size. */
export const pointerPosition = (event: PointerEvent, track: HTMLElement | null) => {
	const rect = track?.getBoundingClientRect();
	if (!(rect && rect.width > 0)) {
		return null;
	}
	return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
};

const MINUS_SIGNS = /[−‒–]/gu;
// Includes the no-break spaces some locales group digits with.
const SPACES = /\s/gu;

/** Reads a number typed in the user's locale: grouping, decimal comma, a Unicode minus. */
export const parseNumber = (text: string): number | null => {
	const parts = new Intl.NumberFormat().formatToParts(-11_111.1);
	const group = parts.find((part) => part.type === "group")?.value ?? ",";
	const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
	const normalized = text
		.replace(MINUS_SIGNS, "-")
		.replace(SPACES, "")
		.replaceAll(group, "")
		.replaceAll(decimal, ".");
	if (normalized === "" || normalized === "-") {
		return null;
	}
	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
};
