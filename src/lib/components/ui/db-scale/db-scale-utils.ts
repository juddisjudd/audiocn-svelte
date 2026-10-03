import { getContext, setContext } from "svelte";

import type { Orientation, Taper } from "#lib/audio/types.js";

const EDGE = 0.02;
/** Space kept between two labels, in pixels. */
const LABEL_GAP = 3;
const MAJOR_STEP = 12;

/**
 * Hides labels that would touch a more important one, so narrow scales stay
 * readable: 0 dB first, then the ends, then multiples of 12, then the rest.
 */
export const thinDbScaleLabels = (scale: HTMLElement) => {
	const horizontal = scale.dataset.orientation !== "vertical";
	const entries: { label: HTMLElement; rank: number; value: number }[] = [];
	for (const tick of scale.querySelectorAll<HTMLElement>("[data-slot=db-scale-tick]")) {
		const label = tick.querySelector<HTMLElement>("[data-slot=db-scale-label]");
		if (label) {
			delete label.dataset.hidden;
			entries.push({ label, rank: 3, value: Number(tick.dataset.value) });
		}
	}
	const values = entries.map((entry) => entry.value);
	const top = Math.max(...values);
	const bottom = Math.min(...values);
	for (const entry of entries) {
		if (entry.value === 0) {
			entry.rank = 0;
		} else if (entry.value === top || entry.value === bottom) {
			entry.rank = 1;
		} else if (entry.value % MAJOR_STEP === 0) {
			entry.rank = 2;
		}
	}
	entries.sort((a, b) => a.rank - b.rank || b.value - a.value);

	const kept: [number, number][] = [];
	for (const { label } of entries) {
		const rect = label.getBoundingClientRect();
		// Not laid out, so there is nothing to compare.
		if (rect.width === 0 && rect.height === 0) {
			continue;
		}
		const start = horizontal ? rect.left : rect.top;
		const end = horizontal ? rect.right : rect.bottom;
		const collides = kept.some(
			([keptStart, keptEnd]) => start < keptEnd + LABEL_GAP && end > keptStart - LABEL_GAP
		);
		if (collides) {
			label.dataset.hidden = "";
		} else {
			kept.push([start, end]);
		}
	}
};

/** Keeps labels at the ends of the scale inside it. */
export const alignClass = (orientation: Orientation, position: number) => {
	if (orientation === "vertical") {
		if (position < EDGE) {
			return "translate-y-0";
		}
		return position > 1 - EDGE ? "translate-y-full" : "translate-y-1/2";
	}
	if (position < EDGE) {
		return "translate-x-0";
	}
	return position > 1 - EDGE ? "-translate-x-full" : "-translate-x-1/2";
};

export const markClass = (horizontal: boolean, major: boolean) => {
	if (horizontal) {
		return major ? "h-1.5 w-px" : "h-1 w-px";
	}
	return major ? "h-px w-1.5" : "h-px w-1";
};

export interface DbScaleContext {
	readonly orientation: Orientation;
	readonly side: "start" | "end";
	readonly labels: boolean;
	readonly taper: Taper;
	readonly format: (db: number) => string;
}

const DB_SCALE_KEY = Symbol("audiocn.db-scale");

export const setDbScaleContext = (value: DbScaleContext): DbScaleContext =>
	setContext(DB_SCALE_KEY, value);

export const useDbScaleContext = (): DbScaleContext => {
	const context = getContext<DbScaleContext | undefined>(DB_SCALE_KEY);
	if (!context) {
		throw new Error("DbScaleTick must be used inside DbScale.");
	}
	return context;
};
