import { getContext, setContext } from "svelte";

import type { Orientation } from "#lib/audio/types.js";

export interface MixerContextValue {
	readonly orientation: Orientation;
	readonly titleId: string;
}

const MIXER_KEY = Symbol("audiocn.mixer");

export const setMixerContext = (value: MixerContextValue): MixerContextValue =>
	setContext(MIXER_KEY, value);

export const getMixerContext = (part: string): MixerContextValue => {
	const context = getContext<MixerContextValue | undefined>(MIXER_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside Mixer.`);
	}
	return context;
};

/** The surrounding mixer's layout, for custom parts. */
export const useMixerContext = (): MixerContextValue => getMixerContext("useMixerContext");
