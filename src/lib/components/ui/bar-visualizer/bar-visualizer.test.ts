import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { VisualFrame } from "#lib/audio/types.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";

import { BarVisualizer } from "./index.js";

// A big drop settles in about 6 s.
const SETTLE_MS = 10_000;

const barLevel = (container: ParentNode = document, index = 0) =>
	Number(
		container
			.querySelector<HTMLElement>(`[data-index="${index}"]`)
			?.style.getPropertyValue("--bar-level")
	);

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
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("visualizers", () => {
	it("bar visualizer: bars fall when levels go away, and data-active follows", () => {
		const { container, rerender } = render(BarVisualizer, {
			"aria-label": "Bands",
			barCount: 5,
			levels: [1, 1, 1, 1, 1],
		});
		advance(500);
		const root = container.querySelector("[data-slot='bar-visualizer']");
		expect(barLevel(container, 2)).toBeGreaterThan(0.8);
		expect(root).toHaveAttribute("data-active");

		rerender({ levels: undefined });
		advance(3000);
		expect(barLevel(container, 2)).toBeLessThan(0.3);
		expect(root).not.toHaveAttribute("data-active");
	});
});

describe("BarVisualizer", () => {
	it("renders the requested number of bars", () => {
		const { container } = render(BarVisualizer, { barCount: 7 });
		expect(container.querySelectorAll('[data-slot="bar-visualizer-bar"]')).toHaveLength(7);
	});

	it("paints declarative levels", () => {
		const { container } = render(BarVisualizer, {
			barCount: 2,
			levels: [0.5, 1],
			minLevel: 0,
		});
		advance(100);
		const bars = container.querySelectorAll<HTMLElement>('[data-slot="bar-visualizer-bar"]');
		expect(bars[0]?.style.getPropertyValue("--bar-level")).toBe("0.5000");
		expect(bars[1]?.style.getPropertyValue("--bar-level")).toBe("1.0000");
	});

	it("paints levels through its handle", () => {
		const { component, container } = render(BarVisualizer, { barCount: 2, minLevel: 0 });
		component.paint([0.25, 0.75]);
		advance(100);
		expect(barLevel(container, 0)).toBeCloseTo(0.25, 3);
		expect(barLevel(container, 1)).toBeCloseTo(0.75, 3);
	});
});

describe("settled painters request no frames", () => {
	it("bar visualizer: static bars settle, and new levels wake them", () => {
		const { rerender } = render(BarVisualizer, { barCount: 3, levels: [0.6, 0.6, 0.6] });
		advance(100);
		expect(barLevel()).toBeCloseTo(0.6, 3);
		expect(vi.getTimerCount()).toBe(0);

		rerender({ levels: [0.1, 0.1, 0.1] });
		advance(50);
		expect(barLevel()).toBeGreaterThan(0.1);
		advance(SETTLE_MS);
		expect(barLevel()).toBeCloseTo(0.1, 2);
		expect(vi.getTimerCount()).toBe(0);
	});

	it("bar visualizer: an idle animation keeps running", () => {
		render(BarVisualizer, { barCount: 3, idle: "pulse" });
		advance(SETTLE_MS);
		expect(vi.getTimerCount()).toBeGreaterThan(0);
	});

	it("bar visualizer: a source frame wakes sleeping bars", () => {
		const source = createFrameEmitter<VisualFrame>();
		render(BarVisualizer, { barCount: 3, source });
		advance(200);
		expect(vi.getTimerCount()).toBe(0);

		flushSync(() => {
			source.emit(visualFrame(0.7));
		});
		advance(100);
		expect(barLevel()).toBeCloseTo(0.7, 2);
		expect(vi.getTimerCount()).toBe(0);
	});
});
