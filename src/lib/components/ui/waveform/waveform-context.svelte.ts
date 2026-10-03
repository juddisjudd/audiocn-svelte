import { getContext, setContext } from "svelte";

export type WaveformVariant = "bars" | "line" | "mirror";

export interface WaveformContextValue {
	readonly peaks: ArrayLike<number> | null;
	readonly duration: number;
	readonly variant: WaveformVariant;
	readonly barWidth: number;
	readonly barGap: number;
	readonly barRadius: number;
	readonly loading: boolean;
	/** Current progress, 0..1, read by the canvas on every frame. Not reactive. */
	readonly progress: { current: number };
	/** The hovered time, or null. */
	readonly hover: number | null;
	/** Whether pointer seeking (and so the hover line) is on. */
	readonly interactive: boolean;
	timeToPosition: (time: number) => number;
}

const WAVEFORM_KEY = Symbol("audiocn.waveform");

export const setWaveform = (value: WaveformContextValue): WaveformContextValue =>
	setContext(WAVEFORM_KEY, value);

export const useWaveform = (part: string): WaveformContextValue => {
	const context = getContext<WaveformContextValue | undefined>(WAVEFORM_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside Waveform.`);
	}
	return context;
};
