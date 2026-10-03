import { extract, type MaybeGetter } from "runed";

import { CLIP_HOLD_MS, CLIP_THRESHOLD_DB } from "#lib/audio/zones.js";

export interface UseClipHoldOptions {
	/** Levels at or above this count as a clip. Default −1 dBFS. */
	thresholdDb?: number;
	/** How long the clip state holds. `Infinity` latches until `reset()`. Default 1500 ms. */
	holdMs?: number;
	onClippingChange?: (clipping: boolean) => void;
}

export interface ClipHold {
	readonly clipping: boolean;
	/** Number of separate clips since mount or the last reset. */
	readonly count: number;
	/** Feed every level reading here. */
	report: (db: number) => void;
	reset: () => void;
}

/** Clip detection with a hold time. Call it during component setup. */
export const useClipHold = (options: MaybeGetter<UseClipHoldOptions> = {}): ClipHold => {
	let clipping = $state(false);
	let count = $state(0);
	// Plain mirrors, so calling `report` inside an effect never subscribes it.
	let clippingNow = false;
	let countNow = 0;
	let above = false;
	let timer: ReturnType<typeof setTimeout> | null = null;

	const update = (next: boolean) => {
		if (clippingNow === next) {
			return;
		}
		clippingNow = next;
		clipping = next;
		extract(options).onClippingChange?.(next);
	};

	const setCount = (next: number) => {
		countNow = next;
		count = next;
	};

	const clearTimer = () => {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const scheduleRelease = () => {
		clearTimer();
		const holdMs = extract(options).holdMs ?? CLIP_HOLD_MS;
		if (Number.isFinite(holdMs)) {
			timer = setTimeout(() => {
				timer = null;
				update(false);
			}, holdMs);
		}
	};

	const report = (db: number) => {
		const isAbove = db >= (extract(options).thresholdDb ?? CLIP_THRESHOLD_DB);
		const wasAbove = above;
		above = isAbove;
		if (!isAbove) {
			return;
		}
		if (!wasAbove) {
			setCount(countNow + 1);
		}
		update(true);
		scheduleRelease();
	};

	const reset = () => {
		clearTimer();
		above = false;
		setCount(0);
		update(false);
	};

	$effect(() => clearTimer);

	return {
		get clipping() {
			return clipping;
		},
		get count() {
			return count;
		},
		report,
		reset,
	};
};
