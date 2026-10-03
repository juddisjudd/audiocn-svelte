import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import { formatPan, PanControl, parsePan } from "./index.js";

describe("PanControl", () => {
	it("formats pan positions", () => {
		expect(formatPan(0)).toBe("C");
		expect(formatPan(-0.3)).toBe("L30");
		expect(formatPan(1)).toBe("R100");
		expect(parsePan("L30")).toBe(-0.3);
		expect(parsePan("r15")).toBe(0.15);
		expect(parsePan("C")).toBe(0);
		expect(parsePan("-50")).toBe(-0.5);
		expect(parsePan("left")).toBeNull();
	});

	it("describes its value", () => {
		render(PanControl, { value: 0.25 });
		expect(screen.getByRole("slider", { name: "Pan" })).toHaveAttribute(
			"aria-valuetext",
			"25% right"
		);
	});

	it("steps with the keyboard and returns to centre on double-click", async () => {
		const onValueChange = vi.fn();
		const onValueCommit = vi.fn();
		render(PanControl, { onValueChange, onValueCommit });
		const thumb = screen.getByRole("slider", { name: "Pan" });
		await fireEvent.keyDown(thumb, { key: "ArrowLeft" });
		expect(onValueChange).toHaveBeenLastCalledWith(-0.05);
		await fireEvent.keyDown(thumb, { key: "PageDown" });
		expect(onValueChange).toHaveBeenLastCalledWith(-0.3);
		await fireEvent.keyDown(thumb, { key: "ArrowRight", shiftKey: true });
		expect(onValueChange).toHaveBeenLastCalledWith(-0.05);
		expect(thumb).toHaveAttribute("aria-valuetext", "5% left");
		await fireEvent.doubleClick(thumb);
		expect(onValueCommit).toHaveBeenLastCalledWith(0);
		expect(thumb).toHaveAttribute("aria-valuetext", "Center");
	});

	it("commits only keys that move it", async () => {
		const onValueCommit = vi.fn();
		render(PanControl, { onValueCommit, value: 1 });
		const thumb = screen.getByRole("slider", { name: "Pan" });
		await fireEvent.keyDown(thumb, { key: "ArrowRight" });
		await fireEvent.keyDown(thumb, { key: "End" });
		expect(onValueCommit).not.toHaveBeenCalled();
		await fireEvent.keyDown(thumb, { key: "Home" });
		expect(onValueCommit).toHaveBeenCalledWith(-1);
	});
});
