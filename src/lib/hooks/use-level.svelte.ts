import { extract, type MaybeGetter } from "runed";

import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
import { SILENCE_DB } from "#lib/audio/decibels.js";
import type { FrameSource, MeterFrame, MeterZone, MeterZoneName } from "#lib/audio/types.js";
import { DEFAULT_ZONES, zoneForDb } from "#lib/audio/zones.js";

const DEFAULT_INTERVAL_MS = 250;

export interface UseLevelOptions {
	/** How often the state updates. Default 250 ms. */
	intervalMs?: number;
	/** A channel index, or `max` for the loudest channel. Default `max`. */
	channel?: number | "max";
	/** Zones used for `zone`. */
	zones?: MeterZone[];
	enabled?: boolean;
}

export interface LevelState {
	readonly peakDb: number;
	readonly rmsDb: number | undefined;
	readonly zone: MeterZoneName;
}

const pickChannel = (frame: MeterFrame, channel: number | "max") => {
	if (channel !== "max") {
		return frame.channels[channel];
	}
	let [loudest] = frame.channels;
	for (const level of frame.channels) {
		if (!loudest || level.peakDb > loudest.peakDb) {
			loudest = level;
		}
	}
	return loudest;
};

/**
 * Reads a meter source into reactive state at a low rate. Use it for labels and
 * conditional UI, not for drawing meters. Call it during component setup.
 */
export const useLevel = (
	source: MaybeGetter<FrameSource<MeterFrame> | null | undefined>,
	options: MaybeGetter<UseLevelOptions> = {}
): LevelState => {
	const enabled = $derived(extract(options).enabled ?? true);
	const intervalMs = $derived(extract(options).intervalMs ?? DEFAULT_INTERVAL_MS);
	const zones = $derived(extract(options).zones ?? DEFAULT_ZONES);

	let latest: MeterFrame | null = null;
	let peakDb = $state(SILENCE_DB);
	let rmsDb = $state<number | undefined>(undefined);

	useFrameSource(
		source,
		(frame) => {
			latest = frame;
		},
		() => ({ enabled })
	);

	$effect(() => {
		if (!enabled) {
			return;
		}
		const timer = setInterval(() => {
			if (!latest) {
				return;
			}
			const picked = pickChannel(latest, extract(options).channel ?? "max");
			peakDb = picked?.peakDb ?? SILENCE_DB;
			rmsDb = picked?.rmsDb;
		}, intervalMs);
		return () => {
			clearInterval(timer);
		};
	});

	const zone = $derived(zoneForDb(peakDb, zones));

	return {
		get peakDb() {
			return peakDb;
		},
		get rmsDb() {
			return rmsDb;
		},
		get zone() {
			return zone;
		},
	};
};
