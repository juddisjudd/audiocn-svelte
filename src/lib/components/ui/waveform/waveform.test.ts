import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWaveformData, type WaveformData } from "#lib/hooks/use-waveform-data.svelte.js";
import { useFakeFrames } from "#test/fake-frames.js";

import { Waveform } from "./index.js";
import HookHarness from "./waveform-data.test.svelte";
import HoverView from "./waveform-hover.test.svelte";

describe("visualizers", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("waveform: leaving clears the hover line even while seeking is off", async () => {
		vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
			DOMRect.fromRect({ height: 80, width: 200 })
		);
		const { container, rerender } = render(HoverView, { loading: false });
		const root = container.querySelector<HTMLElement>("[data-slot='waveform']");
		const hoverLine = () => container.querySelector("[data-slot='waveform-hover']");

		await fireEvent.pointerMove(root as HTMLElement, { clientX: 100 });
		expect(hoverLine()).not.toBeNull();
		// A new track starts loading under the pointer: seeking turns off.
		await rerender({ loading: true });
		expect(hoverLine()).toBeNull();
		await fireEvent.pointerLeave(root as HTMLElement);
		await rerender({ loading: false });
		expect(hoverLine()).toBeNull();
	});
});

describe("useWaveformData", () => {
	it("reports an error, not endless loading, without Web Audio", () => {
		let result: WaveformData | undefined;
		render(HookHarness, {
			setup: () => {
				result = useWaveformData("song.mp3");
			},
		});
		expect(result?.status).toBe("error");
	});
});

describe("Waveform", () => {
	it("seeks with the keyboard", async () => {
		const onSeekCommit = vi.fn();
		render(Waveform, {
			"aria-label": "Clip",
			currentTime: 10,
			duration: 60,
			onSeekCommit,
			peaks: [0.2, 0.5, 1],
		});
		const slider = screen.getByRole("slider", { name: "Clip" });
		expect(slider).toHaveAttribute("aria-valuetext", "0:10 of 1:00");
		await fireEvent.keyDown(slider, { key: "ArrowRight", shiftKey: true });
		expect(onSeekCommit).toHaveBeenCalledWith(25);
		await fireEvent.keyDown(slider, { key: "End" });
		expect(onSeekCommit).toHaveBeenLastCalledWith(60);
	});

	it("is not a slider when display only", () => {
		render(Waveform, { duration: 10, interactive: false, peaks: [1] });
		expect(screen.queryByRole("slider")).toBeNull();
	});
});
