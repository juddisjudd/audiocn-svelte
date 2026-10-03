import { getSharedAudioContext } from "#lib/hooks/use-audio-context.svelte.js";
import { clamp } from "#lib/audio/decibels.js";
import type { Taper } from "#lib/audio/types.js";

export const VIEWBOX = 100;
export const CENTER = 50;
export const RADIUS = 40;
export const FINE_FACTOR = 0.1;
const PRECISION = 1e6;
const DEGREES_TO_RADIANS = Math.PI / 180;
const HALF_TURN = 180;

export type KnobChangeReason = "drag" | "keyboard" | "wheel" | "reset" | "input";

export interface KnobChangeDetails {
	reason: KnobChangeReason;
	event?: Event;
}

export type KnobDragDirection = "vertical" | "horizontal" | "circular";

export type WithSvgElementRef<T, U extends SVGElement> = T & { ref?: U | null };

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

const NUMBER = /[-+]?(?:\d+\.?\d*|\.\d+)/u;
const THOUSANDS = /\d\s*k/iu;
const THOUSAND = 1000;

/** The first number in the text. "−" counts as a minus and "k" as thousands. */
export const parseKnobValue = (text: string): number | null => {
	const normalized = text.replaceAll("−", "-");
	const match = NUMBER.exec(normalized);
	if (!match) {
		return null;
	}
	const number = Number(match[0]);
	return THOUSANDS.test(normalized) ? number * THOUSAND : number;
};

export const angleFor = (position: number, arc: number) => -arc / 2 + position * arc;

/** Coordinates are rounded so server and browser trigonometry agree on hydration. */
const COORDINATE_PRECISION = 1e4;
const roundCoordinate = (value: number) =>
	Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;

export const pointAt = (angle: number, radius: number) => {
	const radians = angle * DEGREES_TO_RADIANS;
	return {
		x: roundCoordinate(CENTER + radius * Math.sin(radians)),
		y: roundCoordinate(CENTER - radius * Math.cos(radians)),
	};
};

export const arcPath = (fromAngle: number, toAngle: number, radius = RADIUS) => {
	const start = Math.min(fromAngle, toAngle);
	const end = Math.max(fromAngle, toAngle);
	if (end - start < 0.01) {
		return "";
	}
	const from = pointAt(start, radius);
	const to = pointAt(end, radius);
	const largeArc = end - start > HALF_TURN ? 1 : 0;
	return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`;
};

interface StepSettings {
	min: number;
	max: number;
	step: number;
	largeStep: number;
	fineStep: number;
}

export const keyTarget = (
	key: string,
	current: number,
	increment: number,
	dial: StepSettings
): number | null => {
	const targets: Record<string, number> = {
		ArrowDown: current - increment,
		ArrowLeft: current - increment,
		ArrowRight: current + increment,
		ArrowUp: current + increment,
		End: dial.max,
		Home: dial.min,
		PageDown: current - dial.largeStep,
		PageUp: current + dial.largeStep,
	};
	return targets[key] ?? null;
};

export const incrementFor = (event: { altKey: boolean; shiftKey: boolean }, dial: StepSettings) => {
	if (event.altKey) {
		return dial.fineStep;
	}
	return event.shiftKey ? dial.largeStep : dial.step;
};

export interface DragState {
	x: number;
	y: number;
	position: number;
	/** The pointer's angle around the dial, or null too close to its centre. */
	angle: number | null;
}

/** Share of the dial's radius around its centre where the angle is too jumpy to read. */
const DEAD_ZONE = 0.25;

/** The pointer's angle around the dial centre, clockwise from 12 o'clock. */
const pointerAngle = (
	event: { clientX: number; clientY: number },
	element: HTMLElement
): number | null => {
	const rect = element.getBoundingClientRect();
	const x = event.clientX - (rect.left + rect.width / 2);
	const y = event.clientY - (rect.top + rect.height / 2);
	if (Math.hypot(x, y) < (rect.width / 2) * DEAD_ZONE) {
		return null;
	}
	return Math.atan2(x, -y) / DEGREES_TO_RADIANS;
};

/** The pointer's angle for circular drags; other drags only need its position. */
export const dragAngle = (
	event: PointerEvent,
	element: HTMLElement,
	dragDirection: KnobDragDirection
) => (dragDirection === "circular" ? pointerAngle(event, element) : null);

/** The shortest turn from one angle to another, in -180..180 degrees. */
const turnBetween = (from: number, to: number) =>
	((to - from + HALF_TURN * 3) % (HALF_TURN * 2)) - HALF_TURN;

/**
 * The next position, from the movement since the last pointer event, so
 * pressing or releasing Shift mid-drag changes the speed without a jump.
 * Circular drags add the turn since the last event, so the knob turns from
 * where it is grabbed and stops at its ends instead of wrapping across the gap.
 */
export const dragPosition = (
	event: PointerEvent,
	last: DragState,
	angle: number | null,
	dial: { dragDirection: KnobDragDirection; sensitivity: number },
	arc: number
) => {
	const fine = event.shiftKey ? FINE_FACTOR : 1;
	if (dial.dragDirection === "circular") {
		if (last.angle === null || angle === null) {
			return last.position;
		}
		const turn = turnBetween(last.angle, angle);
		return clamp(last.position + (turn / arc) * fine, 0, 1);
	}
	const delta = dial.dragDirection === "vertical" ? last.y - event.clientY : event.clientX - last.x;
	return clamp(last.position + (delta / dial.sensitivity) * fine, 0, 1);
};

export const focusDial = (from: HTMLElement) => {
	from
		.closest("[data-slot='knob']")
		?.querySelector<HTMLElement>("[data-slot='knob-dial']")
		?.focus();
};

/** Shortest gap between clicks, so a fast turn ticks instead of buzzing. */
const CLICK_INTERVAL_MS = 30;
const CLICK_SECONDS = 0.006;
const CLICK_VOLUME = 0.12;
/** Each click is pitched a little at random, like a real detent. */
const CLICK_PITCH_SPREAD = 0.04;
/** A short noise snap over a high, fast-damped ring: a tick, not a thud. */
const CLICK_PARTS = [
	{ decay: 0.0004, gain: 0.6, hz: 0 },
	{ decay: 0.0012, gain: 0.4, hz: 4200 },
] as const;

/** Positions this close to a detent count as on it. */
const DETENT_EPSILON = 1e-9;

/** Whether moving between positions reaches or passes a detent. */
export const reachesDetent = (detents: readonly number[], from: number, to: number) =>
	detents.some((detent) =>
		from < to
			? detent > from + DETENT_EPSILON && detent <= to + DETENT_EPSILON
			: detent < from - DETENT_EPSILON && detent >= to - DETENT_EPSILON
	);

/** Whether moving between values reaches or passes a multiple of `every`. */
export const reachesMultiple = (from: number, to: number, min: number, every: number) => {
	const start = roundValue((from - min) / every);
	const end = roundValue((to - min) / every);
	return from < to ? Math.floor(end) > Math.floor(start) : Math.ceil(start) > Math.ceil(end);
};

const clickBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();
let lastClickAt = Number.NEGATIVE_INFINITY;

/** One synthesised click, made once per audio context. */
const clickBuffer = (context: BaseAudioContext) => {
	const cached = clickBuffers.get(context);
	if (cached) {
		return cached;
	}
	const { sampleRate } = context;
	const buffer = context.createBuffer(1, Math.ceil(CLICK_SECONDS * sampleRate), sampleRate);
	const samples = buffer.getChannelData(0);
	for (let index = 0; index < samples.length; index += 1) {
		const time = index / sampleRate;
		let sample = 0;
		for (const part of CLICK_PARTS) {
			const wave = part.hz === 0 ? Math.random() * 2 - 1 : Math.sin(2 * Math.PI * part.hz * time);
			sample += part.gain * wave * Math.exp(-time / part.decay);
		}
		samples[index] = sample;
	}
	clickBuffers.set(context, buffer);
	return buffer;
};

const resumeContext = async (context: AudioContext) => {
	try {
		await context.resume();
	} catch {
		// Without a user gesture the browser refuses; the next one tries again.
	}
};

/** Plays a click through the shared audio context, at most every 30 ms. */
export const playClick = () => {
	const now = performance.now();
	const context = getSharedAudioContext();
	if (!context || now - lastClickAt < CLICK_INTERVAL_MS) {
		return;
	}
	lastClickAt = now;
	if (context.state === "suspended") {
		resumeContext(context);
	}
	const source = context.createBufferSource();
	source.buffer = clickBuffer(context);
	source.playbackRate.value = 1 + (Math.random() - 0.5) * CLICK_PITCH_SPREAD * 2;
	const gain = context.createGain();
	gain.gain.value = CLICK_VOLUME;
	source.connect(gain).connect(context.destination);
	source.addEventListener("ended", () => {
		source.disconnect();
		gain.disconnect();
	});
	source.start();
};
