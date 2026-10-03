import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import { Fader } from "./index.js";
import Harness from "./fader.test.svelte";

const faderInput = () => screen.getByRole("slider");

describe("Fader", () => {
	it("reports its value in dB to assistive technology", () => {
		render(Fader, { "aria-label": "Mic", value: -6 });
		expect(faderInput()).toHaveAttribute("aria-valuetext", "−6.0 dB");
		expect(faderInput()).toHaveAccessibleName("Mic");
	});

	it("steps by step, largeStep and fineStep", async () => {
		const onValueChange = vi.fn();
		render(Fader, { onValueChange, value: 0 });
		await fireEvent.keyDown(faderInput(), { key: "ArrowDown" });
		expect(onValueChange).toHaveBeenLastCalledWith(-0.5, expect.anything());
		await fireEvent.keyDown(faderInput(), { key: "ArrowDown", shiftKey: true });
		expect(onValueChange).toHaveBeenLastCalledWith(-6.5, expect.anything());
		await fireEvent.keyDown(faderInput(), { altKey: true, key: "ArrowUp" });
		expect(onValueChange).toHaveBeenLastCalledWith(-6.4, expect.anything());
	});

	it("jumps to the ends with Home and End, and to silence when allowed", async () => {
		const onValueChange = vi.fn();
		render(Fader, { onValueChange, silenceAtMin: true, value: 0 });
		await fireEvent.keyDown(faderInput(), { key: "End" });
		expect(onValueChange).toHaveBeenLastCalledWith(6, expect.anything());
		await fireEvent.keyDown(faderInput(), { key: "Home" });
		expect(onValueChange).toHaveBeenLastCalledWith(Number.NEGATIVE_INFINITY, expect.anything());
		expect(faderInput()).toHaveAttribute("aria-valuetext", "Silent");
	});

	it("stays put when controlled without an update", async () => {
		render(Harness, { onValueChange: vi.fn(), value: -12 });
		await fireEvent.keyDown(faderInput(), { key: "ArrowUp" });
		expect(faderInput()).toHaveAttribute("aria-valuetext", "−12.0 dB");
	});

	it("follows the pointer on the track, snaps to detents and commits on release", async () => {
		const onValueChange = vi.fn();
		const onValueCommit = vi.fn();
		const { container } = render(Fader, { onValueChange, onValueCommit, value: -30 });
		const control = container.querySelector<HTMLElement>("[data-slot=fader-control]");
		const track = container.querySelector<HTMLElement>("[data-slot=fader-track]");
		if (!(control && track)) {
			throw new Error("Fader parts are missing.");
		}
		control.getBoundingClientRect = () => new DOMRect(-8, 0, 116, 16);
		track.getBoundingClientRect = () => new DOMRect(0, 6, 100, 4);
		await fireEvent.pointerDown(track, { button: 0, clientX: 50, clientY: 8 });
		expect(onValueChange).toHaveBeenLastCalledWith(
			-27,
			expect.objectContaining({ reason: "track-press" })
		);
		await fireEvent.pointerMove(document, { clientX: 91.5, clientY: 8 });
		expect(onValueChange).toHaveBeenLastCalledWith(0, expect.objectContaining({ reason: "drag" }));
		await fireEvent.pointerMove(document, { altKey: true, clientX: 20, clientY: 8 });
		expect(onValueChange).toHaveBeenLastCalledWith(-46.8, expect.anything());
		await fireEvent.pointerUp(document);
		expect(onValueCommit).toHaveBeenCalledWith(-46.8);
	});

	it("commits keyboard changes", async () => {
		const onValueCommit = vi.fn();
		render(Fader, { onValueCommit, value: -3 });
		await fireEvent.keyDown(faderInput(), { key: "PageUp" });
		expect(onValueCommit).toHaveBeenCalledWith(3);
	});

	it("is labelled by its label, takes a typed value and resets", async () => {
		const onValueCommit = vi.fn();
		const { container } = render(Harness, { layout: "full", onValueCommit, value: -6 });
		expect(faderInput()).toHaveAccessibleName("Microphone");
		expect(container.querySelector("[data-slot=db-scale]")).not.toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "−6.0 dB" }));
		const input = screen.getByRole("textbox", { name: "Value in dB" });
		expect(input).toHaveFocus();
		await fireEvent.input(input, { target: { value: "-12.5 dB" } });
		await fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueCommit).toHaveBeenLastCalledWith(-12.5);
		expect(faderInput()).toHaveAttribute("aria-valuetext", "−12.5 dB");
		const reset = screen.getByRole("button", { name: "Reset" });
		expect(reset).toHaveAttribute("data-modified");
		await fireEvent.click(reset);
		expect(onValueCommit).toHaveBeenLastCalledWith(0);
		expect(onValueCommit).toHaveBeenCalledTimes(2);
		expect(reset).toBeDisabled();
	});

	it("runs your onclick on reset first, and preventDefault skips the reset", async () => {
		const onValueCommit = vi.fn();
		const seen: string[] = [];
		render(Harness, {
			layout: "full",
			onValueCommit,
			resetProps: {
				onclick: (event: MouseEvent) => {
					seen.push(faderInput().getAttribute("aria-valuetext") ?? "");
					event.preventDefault();
				},
			},
			value: -6,
		});
		await fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		expect(seen).toEqual(["−6.0 dB"]);
		expect(onValueCommit).not.toHaveBeenCalled();
	});

	it("names its group from the label, and focuses the thumb when the label is clicked", async () => {
		render(Harness, { "aria-label": "Mic", layout: "full", value: -6 });
		expect(screen.getByRole("group", { name: "Microphone" })).toHaveAttribute("data-slot", "fader");
		expect(faderInput()).toHaveAccessibleName("Mic");
		await fireEvent.click(screen.getByText("Microphone"));
		expect(faderInput()).toHaveFocus();
	});
});
