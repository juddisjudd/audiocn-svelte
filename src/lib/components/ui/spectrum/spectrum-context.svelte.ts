import { getContext, setContext } from "svelte";

import type { Taper, VisualFrame } from "#lib/audio/types.js";

export const DEFAULT_FREQUENCY_TICKS = [100, 1000, 10_000];

export type SpectrumVariant = "bars" | "line" | "area";

export interface SpectrumLatestFrame {
	frame: VisualFrame | null;
	/** Bumped on every frame, so each canvas knows whether it has painted it. */
	version: number;
}

export interface SpectrumContextValue {
	readonly minDb: number;
	readonly maxDb: number;
	readonly minHz: number;
	readonly maxHz: number;
	readonly frequencyTaper: Taper;
	readonly variant: SpectrumVariant;
	readonly peakHold: boolean;
	readonly grid: boolean;
	/** The latest frame, outside the reactive graph. */
	readonly latest: SpectrumLatestFrame;
}

const SPECTRUM_KEY = Symbol("audiocn.spectrum");

export const setSpectrum = (value: SpectrumContextValue): SpectrumContextValue =>
	setContext(SPECTRUM_KEY, value);

export const useSpectrum = (part: string): SpectrumContextValue => {
	const context = getContext<SpectrumContextValue | undefined>(SPECTRUM_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside Spectrum.`);
	}
	return context;
};
