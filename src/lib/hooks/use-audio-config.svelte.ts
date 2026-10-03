import { getContext, setContext } from "svelte";

import type { BallisticsInput } from "#lib/audio/ballistics.js";
import type { MeterZone, Orientation } from "#lib/audio/types.js";

export type AudioSize = "sm" | "default" | "lg";

/**
 * Settings a container (a mixer or channel strip) passes down to the audiocn
 * components inside it. Explicit props on a component always win.
 */
export interface AudioConfig {
	orientation?: Orientation;
	size?: AudioSize;
	disabled?: boolean;
	/** Muted or silenced by another channel's solo: meters render dimmed. */
	dimmed?: boolean;
	minDb?: number;
	maxDb?: number;
	zones?: MeterZone[];
	ballistics?: BallisticsInput;
}

const AUDIO_CONFIG_KEY = Symbol("audiocn.audio-config");
const EMPTY_CONFIG: AudioConfig = Object.freeze({});

/**
 * The config from the nearest mixer or channel strip, or `{}`. Call it during
 * component setup. The fields are reactive, so read them where you use them
 * instead of destructuring.
 */
export const useAudioConfig = (): AudioConfig =>
	getContext<AudioConfig | undefined>(AUDIO_CONFIG_KEY) ?? EMPTY_CONFIG;

/**
 * Merges `value` over any config from a parent container and passes the result
 * to every component inside the caller. Call it during component setup.
 */
export const setAudioConfig = (value: () => AudioConfig): AudioConfig => {
	const parent = useAudioConfig();
	const current = $derived(value());
	const merged: AudioConfig = {
		get ballistics() {
			return current.ballistics ?? parent.ballistics;
		},
		get dimmed() {
			return (current.dimmed ?? false) || (parent.dimmed ?? false);
		},
		get disabled() {
			return (current.disabled ?? false) || (parent.disabled ?? false);
		},
		get maxDb() {
			return current.maxDb ?? parent.maxDb;
		},
		get minDb() {
			return current.minDb ?? parent.minDb;
		},
		get orientation() {
			return current.orientation ?? parent.orientation;
		},
		get size() {
			return current.size ?? parent.size;
		},
		get zones() {
			return current.zones ?? parent.zones;
		},
	};
	setContext(AUDIO_CONFIG_KEY, merged);
	return merged;
};
