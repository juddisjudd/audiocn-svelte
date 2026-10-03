const PERCENT = 100;

/** "L30", "C", "R30". */
export const formatPan = (value: number): string => {
	const amount = Math.round(Math.abs(value) * PERCENT);
	if (amount === 0) {
		return "C";
	}
	return `${value < 0 ? "L" : "R"}${amount}`;
};

const CENTER_TEXT = /^c(?:enter|entre)?$/iu;
const SIDE_PREFIX = /^[LR]/iu;

/** Reads "L30", "R15", "C" or a number from −100 to 100; the inverse of formatPan. */
export const parsePan = (text: string): number | null => {
	const trimmed = text.trim().replaceAll("−", "-");
	if (CENTER_TEXT.test(trimmed)) {
		return 0;
	}
	const side = SIDE_PREFIX.test(trimmed) ? trimmed[0]?.toUpperCase() : null;
	const digits = (side ? trimmed.slice(1) : trimmed).trim();
	const amount = Number(digits) / PERCENT;
	if (digits === "" || Number.isNaN(amount)) {
		return null;
	}
	return side === "L" ? -Math.abs(amount) : amount;
};

export const describePan = (value: number): string => {
	const amount = Math.round(Math.abs(value) * PERCENT);
	if (amount === 0) {
		return "Center";
	}
	return `${amount}% ${value < 0 ? "left" : "right"}`;
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

/** Where a pointer is along a horizontal track, 0..1, or null when it has no size. */
export const pointerPosition = (event: PointerEvent, track: HTMLElement | null) => {
	const rect = track?.getBoundingClientRect();
	if (!(rect && rect.width > 0)) {
		return null;
	}
	return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
};
