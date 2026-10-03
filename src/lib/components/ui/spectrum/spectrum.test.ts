import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { VisualFrame } from "#lib/audio/types.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";

import { Spectrum } from "./index.js";
import TwoCanvases from "./spectrum-two-canvases.test.svelte";

const frameOf = (bands: number[]): VisualFrame => ({
	bands: Float32Array.from(bands),
	history: new Float32Array(1),
	historyLength: 0,
	historyStart: 0,
	peakDb: -12,
});

/** One recording 2D context per canvas, so canvases can be told apart. */
const stubCanvases = () => {
	const clears = new Map<HTMLCanvasElement, number>();
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function getContext(
		this: HTMLCanvasElement
	) {
		return {
			arc: vi.fn(),
			beginPath: vi.fn(),
			clearRect: () => {
				clears.set(this, (clears.get(this) ?? 0) + 1);
			},
			clip: vi.fn(),
			closePath: vi.fn(),
			createLinearGradient: () => ({ addColorStop: vi.fn() }),
			fill: vi.fn(),
			fillRect: vi.fn(),
			fillText: vi.fn(),
			lineTo: vi.fn(),
			moveTo: vi.fn(),
			rect: vi.fn(),
			restore: vi.fn(),
			save: vi.fn(),
			setTransform: vi.fn(),
			stroke: vi.fn(),
		} as unknown as CanvasRenderingContext2D;
	} as unknown as HTMLCanvasElement["getContext"]);
	vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
		DOMRect.fromRect({ height: 80, width: 240 })
	);
	return clears;
};

describe("visualizers", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("spectrum: every canvas repaints on a new frame", () => {
		const clears = stubCanvases();
		const source = createFrameEmitter<VisualFrame>();
		const { container } = render(TwoCanvases, { source });
		advance(100);
		const canvases = [...container.querySelectorAll("canvas")];
		expect(canvases).toHaveLength(2);
		const before = canvases.map((canvas) => clears.get(canvas) ?? 0);
		flushSync(() => {
			source.emit(frameOf([0.5, 0.8, 0.3]));
		});
		advance(50);
		for (const [index, canvas] of canvases.entries()) {
			expect(clears.get(canvas) ?? 0).toBeGreaterThan(before[index] ?? 0);
		}
	});

	it("spectrum: renders both axes and a canvas by default", () => {
		stubCanvases();
		const { container, getByRole } = render(Spectrum);
		expect(getByRole("img", { name: "Frequency spectrum" })).toHaveAttribute(
			"data-variant",
			"bars"
		);
		expect(container.querySelector("[data-slot='spectrum-canvas']")).not.toBeNull();
		const labels = (slot: string) =>
			[...container.querySelectorAll(`[data-slot='${slot}'] span`)].map((tick) =>
				tick.textContent?.trim()
			);
		expect(labels("spectrum-frequency-axis")).toEqual(["100", "1k", "10k"]);
		expect(labels("spectrum-level-axis")).toEqual(["-30", "-42", "-54", "-66", "-78", "-90"]);
	});
});
