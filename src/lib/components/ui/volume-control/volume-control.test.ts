import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import { VolumeControl } from "./index.js";

describe("VolumeControl", () => {
	it("mutes and restores the last audible volume", async () => {
		const onValueChange = vi.fn();
		render(VolumeControl, { onValueChange, value: 0 });
		const mute = screen.getByRole("button", { name: "Mute" });
		expect(mute).toHaveAttribute("data-level", "muted");
		await fireEvent.click(mute);
		await fireEvent.click(screen.getByRole("button", { name: "Unmute" }));
		expect(onValueChange).toHaveBeenCalledWith(1);
	});

	it("steps the slider in perceptual positions and unmutes when raised", async () => {
		const onValueChange = vi.fn();
		const onValueCommit = vi.fn();
		render(VolumeControl, { muted: true, onValueChange, onValueCommit, value: 0.25 });
		const slider = screen.getByRole("slider", { name: "Volume" });
		expect(slider).toHaveAttribute("aria-valuetext", "Muted");
		await fireEvent.keyDown(slider, { key: "ArrowUp" });
		expect(onValueChange.mock.lastCall?.[0]).toBeCloseTo(0.0025);
		expect(onValueCommit.mock.lastCall?.[0]).toBeCloseTo(0.0025);
		expect(screen.getByRole("button", { name: "Mute" })).toHaveAttribute("data-level", "low");
		await fireEvent.keyDown(slider, { key: "End" });
		expect(slider).toHaveAttribute("aria-valuetext", "100%");
	});
});
