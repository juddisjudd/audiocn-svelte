import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFrameEmitter, createFrameRelay } from "#lib/audio/frame-source.js";
import type { VisualFrame } from "#lib/audio/types.js";
import { createDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";

import { LiveWaveform } from "./index.js";

// `prefersReducedMotion` reads matchMedia once, at import, so a test switches
// reduced motion through the hook instead of stubbing matchMedia.
const motion = vi.hoisted(() => ({ reduced: false }));

vi.mock("#lib/hooks/use-reduced-motion.svelte.js", () => ({
	useReducedMotion: () => ({
		get current() {
			return motion.reduced;
		},
	}),
}));

const frameOf = (): VisualFrame => ({
	bands: Float32Array.of(0.5),
	history: Float32Array.of(0.25, 0.5, 0.75, 1, 0, 0, 0, 0),
	historyIntervalMs: 50,
	historyLength: 4,
	historyStart: 0,
	historyUpdatedAt: 0,
	peakDb: -12,
});

const stubCanvas = (width = 24) => {
	const bars: {
		x: number;
		height: number;
		alpha: number;
		coversCenter: boolean;
	}[] = [];
	const points: { x: number; y: number }[] = [];
	let centerVisible = true;
	let pathContainsCenter = false;
	const visibilityStack: boolean[] = [];
	const context = {
		beginPath: () => {
			pathContainsCenter = false;
		},
		clearRect: vi.fn(() => {
			bars.length = 0;
			points.length = 0;
		}),
		clip: () => {
			centerVisible &&= pathContainsCenter;
		},
		closePath: vi.fn(),
		createLinearGradient: () => ({ addColorStop: vi.fn() }),
		fill: vi.fn(),
		fillRect: vi.fn(),
		globalAlpha: 1,
		lineTo: (x: number, y: number) => points.push({ x, y }),
		moveTo: (x: number, y: number) => points.push({ x, y }),
		rect: (x: number, _y: number, rectWidth: number) => {
			pathContainsCenter ||= x <= width / 2 && width / 2 < x + rectWidth;
		},
		restore: () => {
			centerVisible = visibilityStack.pop() ?? true;
		},
		roundRect: (x: number, _y: number, barWidth: number, height: number) =>
			bars.push({
				alpha: context.globalAlpha,
				coversCenter: centerVisible && x <= width / 2 && width / 2 < x + barWidth,
				height,
				x,
			}),
		save: () => {
			visibilityStack.push(centerVisible);
		},
		setTransform: vi.fn(),
		stroke: vi.fn(),
	};
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
		context as unknown as CanvasRenderingContext2D
	);
	vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
		DOMRect.fromRect({ height: 80, width })
	);
	return { bars, context, points };
};

/** A 2D context that only counts paints, for the settled painter tests. */
const stubCountingCanvas = () => {
	const clearRect = vi.fn();
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		beginPath: vi.fn(),
		clearRect,
		createLinearGradient: () => ({ addColorStop: vi.fn() }),
		fill: vi.fn(),
		fillRect: vi.fn(),
		lineTo: vi.fn(),
		moveTo: vi.fn(),
		rect: vi.fn(),
		roundRect: vi.fn(),
		setTransform: vi.fn(),
		stroke: vi.fn(),
	} as unknown as CanvasRenderingContext2D);
	vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
		DOMRect.fromRect({ height: 40, width: 200 })
	);
	return clearRect;
};

const visualFrame = (level: number): VisualFrame => ({
	bands: Float32Array.from([level, level, level]),
	history: Float32Array.from([level, level, level]),
	historyLength: 3,
	historyStart: 0,
	peakDb: -12,
});

beforeEach(() => {
	useFakeFrames();
});

afterEach(() => {
	motion.reduced = false;
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("LiveWaveform scrolling", () => {
	it("moves bars between source frames at one pitch per history interval", () => {
		const { bars } = stubCanvas();
		const { component } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling" });
		component.paint(frameOf());
		advance(64);
		const firstX = bars.find((bar) => bar.height === 40)?.x ?? Number.NaN;
		advance(16);
		const nextX = bars.find((bar) => bar.height === 40)?.x ?? Number.NaN;
		expect(firstX - nextX).toBeCloseTo((4 * 16) / 50);
	});

	it("does not jump when the next sample arrives late on the same mutable frame", () => {
		const { bars } = stubCanvas();
		const { component } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling" });
		const frame = frameOf();
		component.paint(frame);
		advance(48);
		frame.history[4] = 0.125;
		frame.historyLength = 5;
		frame.historyUpdatedAt = 50;
		component.paint(frame);
		advance(48);
		const firstX = bars.find((bar) => bar.height === 40)?.x ?? Number.NaN;
		advance(16);
		expect(firstX - (bars.find((bar) => bar.height === 40)?.x ?? Number.NaN)).toBeCloseTo(
			(4 * 16) / 50
		);
	});

	it("keeps the extra bar at the left edge when the visible window is full", () => {
		const { bars } = stubCanvas(12);
		const { component } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling" });
		component.paint(frameOf());
		advance(64);
		expect(bars).toHaveLength(4);
		expect(bars[0]?.x).toBeCloseTo(0.5 - (4 * 14) / 50);
	});

	it("keeps the outgoing bar visible after the source ring wraps", () => {
		const { bars } = stubCanvas();
		const { component } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling" });
		const frame = frameOf();
		frame.history = Float32Array.of(0.25, 0.5, 0.75, 1);
		component.paint(frame);
		advance(48);
		frame.history[0] = 0.125;
		frame.historyStart = 1;
		frame.historyUpdatedAt = 50;
		frame.historyPreviousLevel = 0.25;
		component.paint(frame);
		advance(48);
		const firstX = bars.find((bar) => bar.height === 20)?.x ?? Number.NaN;
		advance(16);
		expect(firstX - (bars.find((bar) => bar.height === 20)?.x ?? Number.NaN)).toBeCloseTo(
			(4 * 16) / 50
		);
	});

	it("moves a scrolling line between source frames", () => {
		const { points } = stubCanvas();
		const { component } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
			variant: "line",
		});
		component.paint(frameOf());
		advance(64);
		const firstX = points[0]?.x ?? Number.NaN;
		advance(16);
		expect(firstX - (points[0]?.x ?? Number.NaN)).toBeCloseTo(((24 / 5) * 16) / 50);
	});

	it.each([20, 24])("moves mirrored history out from the center at width %i", (width) => {
		const { bars } = stubCanvas(width);
		const { component } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
			variant: "mirror",
		});
		component.paint(frameOf());
		advance(64);
		const first = bars
			.filter((bar) => bar.height === 60)
			.map((bar) => bar.x)
			.toSorted((a, b) => a - b);
		advance(16);
		const next = bars
			.filter((bar) => bar.height === 60)
			.map((bar) => bar.x)
			.toSorted((a, b) => a - b);
		expect(first).toHaveLength(2);
		expect((first[0] ?? Number.NaN) - (next[0] ?? Number.NaN)).toBeCloseTo((4 * 16) / 50);
		expect((next[1] ?? Number.NaN) - (first[1] ?? Number.NaN)).toBeCloseTo((4 * 16) / 50);
		expect((next[0] ?? Number.NaN) + (next[1] ?? Number.NaN) + 3).toBeCloseTo(width);
	});

	it("keeps mirrored center opacity steady across sample boundaries", () => {
		const { bars } = stubCanvas();
		const { component } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
			variant: "mirror",
		});
		const frame = frameOf();
		frame.history.fill(0.25);
		frame.historyUpdatedAt = 16;
		component.paint(frame);
		for (let index = 0; index < 8; index += 1) {
			advance(16);
			const opacity = bars
				.filter((bar) => bar.coversCenter)
				.reduce((alpha, bar) => alpha + (1 - alpha) * bar.alpha, 0);
			expect(opacity).toBeCloseTo(0.55);
			if (index === 3) {
				frame.historyUpdatedAt = 66;
				frame.historyLength += 1;
				component.paint(frame);
			}
		}
	});

	it("stops moving after one interval without new history, and clears", () => {
		const { context, bars } = stubCanvas();
		const { component } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling" });
		component.paint(frameOf());
		advance(160);
		const paints = context.clearRect.mock.calls.length;
		advance(160);
		expect(context.clearRect).toHaveBeenCalledTimes(paints);
		expect(vi.getTimerCount()).toBe(0);
		component.clear();
		advance(16);
		expect(bars).toHaveLength(0);
	});

	it("clears a sleeping waveform when its source is disconnected", () => {
		const { bars } = stubCanvas();
		const source = createFrameEmitter<VisualFrame>();
		const { rerender } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling", source });
		source.emit(frameOf());
		advance(160);
		expect(bars.length).toBeGreaterThan(0);
		expect(vi.getTimerCount()).toBe(0);

		rerender({ source: null });
		advance(16);
		expect(bars).toHaveLength(0);
		expect(vi.getTimerCount()).toBe(0);
	});

	it("keeps scrolling continuous when drawing options change", () => {
		const { bars } = stubCanvas(240);
		const signal = createDemoSignal({ kind: "tone" });
		const { rerender } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
			source: signal.visual,
		});
		advance(272);
		const x = bars[0]?.x ?? Number.NaN;
		rerender({ sensitivity: 2 });
		advance(16);
		expect(x - (bars[0]?.x ?? Number.NaN)).toBeCloseTo(1);
	});

	it.each([0, 16])("replaces same-timestamp history after a %i ms source delay", (delayMs) => {
		const { bars } = stubCanvas();
		const first = createFrameEmitter<VisualFrame>();
		const second = createFrameEmitter<VisualFrame>();
		const { rerender } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
			source: first,
		});
		const frame = frameOf();
		frame.history.fill(0.25);
		first.emit(frame);
		advance(256);
		expect(bars[0]?.height).toBe(20);
		rerender({ source: second });
		advance(delayMs);
		const replacement = frameOf();
		replacement.history.fill(0.75);
		second.emit(replacement);
		advance(16);
		expect(bars[0]?.height).toBe(60);
	});

	it("clears buffered history before painting within the same frame", () => {
		const { bars } = stubCanvas();
		const { component } = render(LiveWaveform, { fadeEdges: false, mode: "scrolling" });
		const frame = frameOf();
		frame.history.fill(0.25);
		component.paint(frame);
		advance(256);
		expect(bars[0]?.height).toBe(20);
		component.clear();
		frame.history.fill(0.75);
		component.paint(frame);
		advance(16);
		expect(bars[0]?.height).toBe(60);
	});

	it("keeps untimed custom sources and static mode still between frames", () => {
		const { context } = stubCanvas();
		const { component, rerender } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
		});
		const frame = frameOf();
		delete frame.historyUpdatedAt;
		delete frame.historyIntervalMs;
		component.paint(frame);
		advance(16);
		let paints = context.clearRect.mock.calls.length;
		advance(32);
		expect(context.clearRect).toHaveBeenCalledTimes(paints);
		rerender({ mode: undefined });
		component.paint(frameOf());
		advance(16);
		paints = context.clearRect.mock.calls.length;
		advance(32);
		expect(context.clearRect).toHaveBeenCalledTimes(paints);
	});

	it("keeps the reduced-motion paint limit", () => {
		motion.reduced = true;
		const { context } = stubCanvas();
		const signal = createDemoSignal();
		render(LiveWaveform, { fadeEdges: false, mode: "scrolling", source: signal.visual });
		advance(1024);
		expect(context.clearRect).toHaveBeenCalledTimes(4);
	});

	it("moves steadily when a source connects after the painter", () => {
		const { bars } = stubCanvas(240);
		const relay = createFrameRelay<VisualFrame>();
		render(LiveWaveform, { fadeEdges: false, mode: "scrolling", source: relay });
		advance(16);
		relay.setSource(createDemoSignal({ kind: "tone" }).visual);
		advance(160);
		let previousX = bars[0]?.x ?? Number.NaN;
		for (let index = 0; index < 8; index += 1) {
			advance(16);
			const x = bars[0]?.x ?? Number.NaN;
			expect(previousX - x).toBeCloseTo((4 * 16) / 64);
			previousX = x;
		}
	});

	it("moves on each paint with the default demo source and stops on unmount", () => {
		const { bars, context } = stubCanvas(240);
		const signal = createDemoSignal({ kind: "tone" });
		const { unmount } = render(LiveWaveform, {
			fadeEdges: false,
			mode: "scrolling",
			source: signal.visual,
		});
		advance(192);
		const firstX = bars[0]?.x ?? Number.NaN;
		advance(16);
		expect(firstX - (bars[0]?.x ?? Number.NaN)).toBeCloseTo((4 * 16) / 64);
		unmount();
		const paints = context.clearRect.mock.calls.length;
		advance(64);
		expect(context.clearRect).toHaveBeenCalledTimes(paints);
	});
});

describe("settled painters request no frames", () => {
	it("live waveform: draws, sleeps, and redraws on the next frame", () => {
		const clearRect = stubCountingCanvas();
		const source = createFrameEmitter<VisualFrame>();
		render(LiveWaveform, { mode: "scrolling", source });
		advance(100);
		const drawn = clearRect.mock.calls.length;
		expect(drawn).toBeGreaterThan(0);
		expect(vi.getTimerCount()).toBe(0);

		flushSync(() => {
			source.emit(visualFrame(0.5));
		});
		advance(50);
		expect(clearRect.mock.calls.length).toBe(drawn + 1);
		expect(vi.getTimerCount()).toBe(0);
	});

	it("live waveform: a theme change makes a sleeping waveform re-read its colour", async () => {
		stubCountingCanvas();
		render(LiveWaveform, { source: createFrameEmitter<VisualFrame>() });
		advance(100);
		const styleReads = vi.spyOn(window, "getComputedStyle");

		document.documentElement.classList.add("dark");
		await Promise.resolve();
		flushSync();
		advance(50);
		expect(styleReads).toHaveBeenCalled();
		expect(vi.getTimerCount()).toBe(0);
		document.documentElement.classList.remove("dark");
	});
});
