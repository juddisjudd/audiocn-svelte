import { render, screen } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { MeterFrame } from "#lib/audio/types.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";
import { LevelMeter } from "./index.js";
import LevelMeterWithValue from "./level-meter-with-value.test.svelte";

const CLIP_HOLD_MS = 1500;

// −12 and −40 dBFS on the default linear −60..0 range.
const AT_MINUS_12 = 0.8;
const AT_MINUS_40 = 1 / 3;
// A big drop settles in about 6 s: the peak hold waits 1.2 s, then falls.
const SETTLE_MS = 10_000;

const channelElement = (index = 0) =>
	document.querySelector<HTMLElement>(`[data-slot="level-meter-channel"][data-index="${index}"]`);

const levelOf = (index = 0) =>
	Number(channelElement(index)?.style.getPropertyValue("--meter-level"));

const meterLevel = () =>
	Number(
		document
			.querySelector<HTMLElement>("[data-slot='level-meter-channel']")
			?.style.getPropertyValue("--meter-level")
	);

const entries = (visible: boolean) => [{ isIntersecting: visible } as IntersectionObserverEntry];

/** IntersectionObserver that the test drives by hand. */
const stubVisibility = () => {
	const observers: IntersectionObserverCallback[] = [];
	class ObserverStub {
		constructor(notify: IntersectionObserverCallback) {
			observers.push(notify);
		}
		observe = vi.fn();
		disconnect = vi.fn();
	}
	vi.stubGlobal("IntersectionObserver", ObserverStub);
	return (visible: boolean) => {
		for (const notify of observers) {
			notify(entries(visible), {} as IntersectionObserver);
		}
		flushSync();
	};
};

describe("LevelMeter", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders a labelled meter with its range", () => {
		render(LevelMeter, { props: { "aria-label": "Mic", peakDb: -12 } });
		const meter = screen.getByRole("meter", { name: "Mic" });
		expect(meter).toHaveAttribute("aria-valuemin", "-60");
		expect(meter).toHaveAttribute("aria-valuemax", "0");
	});

	it("paints declarative values and reports them to assistive technology", () => {
		render(LevelMeter, { props: { "aria-label": "Mic", peakDb: -6 } });
		advance(400);
		expect(levelOf()).toBeCloseTo(0.9, 2);
		expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "-6.0");
		expect(channelElement()).toHaveAttribute("data-zone", "clip");
	});

	it("follows a frame source", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		render(LevelMeter, { props: { "aria-label": "Mic", source: emitter } });
		emitter.emit({ channels: [{ peakDb: -30 }] });
		flushSync();
		advance(400);
		expect(levelOf()).toBeCloseTo(0.5, 2);
	});

	it("adds tracks for every channel in the frames", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		render(LevelMeter, { props: { "aria-label": "Program", source: emitter } });
		advance(20);
		emitter.emit({ channels: [{ peakDb: -12 }, { peakDb: -24 }] });
		flushSync();
		advance(400);
		expect(channelElement(1)).not.toBeNull();
		expect(levelOf(1)).toBeCloseTo(0.6, 2);
	});

	it("paints through the exported paint function", () => {
		const { component } = render(LevelMeter, { props: { "aria-label": "Mic" } });
		component.paint({ channels: [{ peakDb: -18 }] });
		flushSync();
		advance(400);
		expect(levelOf()).toBeCloseTo(0.7, 2);
	});

	it("marks clipping on the root", () => {
		render(LevelMeter, { props: { "aria-label": "Mic", peakDb: 0 } });
		advance(100);
		expect(screen.getByRole("meter")).toHaveAttribute("data-clipping");
	});

	it("uses the orientation it is given", () => {
		render(LevelMeter, {
			props: { "aria-label": "Mic", orientation: "vertical", peakDb: -6 },
		});
		expect(screen.getByRole("meter")).toHaveAttribute("data-orientation", "vertical");
	});
});

describe("meters across re-renders", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("clears data-clipping when the painter is rebuilt mid-clip", () => {
		const { rerender } = render(LevelMeter, { props: { "aria-label": "Mic", peakDb: 0 } });
		advance(50);
		const meter = screen.getByRole("meter");
		expect(meter).toHaveAttribute("data-clipping");

		// A ballistics change rebuilds the painter while the clip is held.
		rerender({ ballistics: "vu", peakDb: -20 });
		advance(CLIP_HOLD_MS + 500);
		expect(meter).not.toHaveAttribute("data-clipping");
	});

	it("renders its zone fill under the user's style", () => {
		render(LevelMeter, {
			props: {
				"aria-label": "Styled",
				peakDb: -12,
				style: "--meter-fill: var(--meter-warn)",
			},
		});
		expect(screen.getByRole("meter").style.getPropertyValue("--meter-fill")).toBe(
			"var(--meter-warn)"
		);
	});

	it("keeps showing a declarative level in LevelMeterValue", () => {
		render(LevelMeterWithValue, { props: { peakDb: -12 } });
		advance(1000);
		expect(document.querySelector("[data-slot='db-readout']")).toHaveTextContent("−12.0 dB");
	});
});

describe("settled painters request no frames", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("level meter: sleeps once settled, and a new value wakes it", () => {
		const { rerender } = render(LevelMeter, { props: { "aria-label": "Mic", peakDb: -12 } });
		advance(100);
		expect(meterLevel()).toBeCloseTo(AT_MINUS_12, 3);
		expect(vi.getTimerCount()).toBe(0);

		rerender({ peakDb: -40 });
		expect(vi.getTimerCount()).toBeGreaterThan(0);
		advance(SETTLE_MS);
		expect(meterLevel()).toBeCloseTo(AT_MINUS_40, 2);
		expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "−40.0 dB");
		expect(vi.getTimerCount()).toBe(0);
	});

	it("level meter: falls smoothly after a long sleep instead of jumping", () => {
		const { rerender } = render(LevelMeter, { props: { "aria-label": "Mic", peakDb: -12 } });
		advance(SETTLE_MS);

		rerender({ peakDb: -40 });
		advance(20);
		expect(meterLevel()).toBeGreaterThan(0.6);
		expect(meterLevel()).toBeLessThan(AT_MINUS_12);
	});

	it("level meter: sleeps off screen and catches up when it comes back", () => {
		const setVisible = stubVisibility();
		const { rerender } = render(LevelMeter, { props: { "aria-label": "Mic", peakDb: -12 } });
		advance(100);

		setVisible(false);
		rerender({ peakDb: -40 });
		advance(SETTLE_MS);
		expect(meterLevel()).toBeCloseTo(AT_MINUS_12, 3);
		expect(vi.getTimerCount()).toBe(0);

		setVisible(true);
		advance(SETTLE_MS);
		expect(meterLevel()).toBeCloseTo(AT_MINUS_40, 2);
		expect(vi.getTimerCount()).toBe(0);
	});

	it("level meter: holds a steady clip without frames, and counts the light down after", () => {
		const { rerender } = render(LevelMeter, { props: { "aria-label": "Mic", peakDb: 0 } });
		advance(100);
		const meter = screen.getByRole("meter");
		expect(meter).toHaveAttribute("data-clipping");
		expect(vi.getTimerCount()).toBe(0);

		rerender({ peakDb: -30 });
		advance(1000);
		expect(meter).toHaveAttribute("data-clipping");
		advance(SETTLE_MS);
		expect(meter).not.toHaveAttribute("data-clipping");
		expect(vi.getTimerCount()).toBe(0);
	});
});
