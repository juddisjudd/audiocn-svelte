import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import Harness from "./parameter-slider.test.svelte";

describe("ParameterSlider", () => {
	it("steps within its range and labels the thumb", async () => {
		const onValueChange = vi.fn();
		render(Harness, {
			label: "Sync",
			max: 1000,
			min: -1000,
			onValueChange,
			step: 5,
			unit: "ms",
		});
		const thumb = screen.getByRole("slider", { name: "Sync" });
		await fireEvent.keyDown(thumb, { key: "ArrowUp" });
		expect(onValueChange).toHaveBeenLastCalledWith(-995, expect.anything());
		await fireEvent.keyDown(thumb, { key: "End" });
		expect(onValueChange).toHaveBeenLastCalledWith(1000, expect.anything());
	});

	it("takes a typed value, clamped, and commits it on blur", async () => {
		const onValueChange = vi.fn();
		const onValueCommit = vi.fn();
		render(Harness, {
			input: true,
			label: "Delay",
			max: 500,
			onValueChange,
			onValueCommit,
			step: 0.5,
			unit: "ms",
			value: 20,
		});
		const input = screen.getByRole("textbox", { name: "Delay" });
		expect(input).toHaveValue("20.0");
		await fireEvent.input(input, { target: { value: "120.25" } });
		expect(onValueChange).toHaveBeenLastCalledWith(
			120.3,
			expect.objectContaining({ reason: "input" })
		);
		expect(onValueCommit).not.toHaveBeenCalled();
		await fireEvent.input(input, { target: { value: "900" } });
		await fireEvent.blur(input);
		expect(onValueCommit).toHaveBeenLastCalledWith(500);
		expect(input).toHaveValue("500.0");
		expect(screen.getByRole("slider", { name: "Delay" })).toHaveAttribute(
			"aria-valuetext",
			"500.0 ms"
		);
		await fireEvent.keyDown(input, { key: "ArrowDown", shiftKey: true });
		expect(onValueCommit).toHaveBeenLastCalledWith(490);
	});

	it("steps the input like a number field, committing only real changes", async () => {
		const onValueCommit = vi.fn();
		render(Harness, { input: true, label: "Mix", onValueCommit, step: 0.5, value: 100 });
		const input = screen.getByRole("textbox", { name: "Mix" });
		await fireEvent.keyDown(input, { key: "ArrowUp" });
		await fireEvent.keyDown(input, { key: "End" });
		await fireEvent.keyDown(input, { key: "PageDown" });
		await fireEvent.keyDown(input, { ctrlKey: true, key: "ArrowDown" });
		expect(onValueCommit).not.toHaveBeenCalled();
		await fireEvent.keyDown(input, { altKey: true, key: "ArrowDown" });
		expect(onValueCommit).toHaveBeenLastCalledWith(99.9);
	});
});

describe("controls", () => {
	it("parameter slider: steps from the parent's value after it rejected a change", async () => {
		const onValueChange = vi.fn();
		const props = (className: string) => ({
			class: className,
			max: 10,
			min: 0,
			onValueChange,
			parentValue: 0,
			step: 1,
		});
		const { rerender } = render(Harness, props("a"));
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
		// An unrelated re-render; the parent still says 0.
		await rerender(props("b"));
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
		const reported = onValueChange.mock.calls.map(([value]) => value);
		expect(reported).toContain(1);
		expect(reported).not.toContain(2);
	});
});
