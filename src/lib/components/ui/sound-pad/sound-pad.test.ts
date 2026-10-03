import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";

import { SoundPad } from "./index.js";
import Grid from "./sound-pad-grid.test.svelte";

const text = (value: string) =>
	createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

const holdPad = (props: { loading?: boolean; onStop: () => void }) => ({
	hotkeyScope: "global" as const,
	hotkeys: true,
	pads: [
		{
			hotkey: "a",
			label: "A",
			loading: props.loading,
			mode: "hold" as const,
			onStop: props.onStop,
			onTrigger: vi.fn(),
		},
	],
});

describe("SoundPad", () => {
	it("moves focus with arrow keys even when a trigger replaces the pad's slot", async () => {
		render(Grid, {
			props: {
				"aria-label": "Pads",
				pads: [
					{ "data-slot": "context-menu-trigger", label: "One" },
					{ "data-slot": "context-menu-trigger", label: "Two" },
				],
			},
		});
		const first = screen.getByRole("button", { name: "One" });
		first.focus();
		await fireEvent.keyDown(first, { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
	});

	it("keeps its accent when a trigger passes its own style", () => {
		render(SoundPad, { props: { accent: "red", children: text("Pad"), style: "--from-test: 1" } });
		const pad = screen.getByRole("button", { name: "Pad" });
		expect(pad.style.getPropertyValue("--pad-accent")).toBe("red");
		expect(pad.style.getPropertyValue("--from-test")).toBe("1");
	});

	it("caps grid columns and keeps a minimum pad width", () => {
		render(Grid, {
			props: {
				"aria-label": "Pads",
				columns: 4,
				pads: [{ label: "Pad" }],
				style: "--from-test: 1",
			},
		});
		const grid = screen.getByRole("group", { name: "Pads" });
		const columns = grid.style.getPropertyValue("--pad-columns");
		expect(columns).toContain("auto-fill");
		expect(columns).toContain("/ 4");
		expect(grid.style.getPropertyValue("--from-test")).toBe("1");
	});

	it("toggles in toggle mode", async () => {
		const onTrigger = vi.fn();
		const onStop = vi.fn();
		const { rerender } = render(SoundPad, {
			props: { children: text("Pad"), mode: "toggle", onStop, onTrigger },
		});
		const pad = screen.getByRole("button", { name: "Pad" });
		await fireEvent.pointerDown(pad, { button: 0 });
		expect(onTrigger).toHaveBeenCalledTimes(1);
		rerender({ playing: true });
		expect(pad).toHaveAttribute("aria-pressed", "true");
		await fireEvent.pointerDown(pad, { button: 0 });
		expect(onStop).toHaveBeenCalledTimes(1);
	});

	it("stops a hold pad on release", async () => {
		const onStop = vi.fn();
		render(SoundPad, {
			props: { children: text("Hold"), mode: "hold", onStop, onTrigger: vi.fn() },
		});
		const pad = screen.getByRole("button", { name: "Hold" });
		await fireEvent.pointerDown(pad, { button: 0 });
		await fireEvent.pointerUp(pad);
		expect(onStop).toHaveBeenCalledTimes(1);
	});

	it("triggers from a grid hotkey but not while typing", async () => {
		const onTrigger = vi.fn();
		render(Grid, {
			props: {
				hotkeyScope: "global",
				hotkeys: true,
				pads: [{ hotkey: "q", label: "Q", onTrigger }],
				withInput: true,
			},
		});
		await fireEvent.keyDown(document.body, { key: "q" });
		await fireEvent.keyUp(document.body, { key: "q" });
		expect(onTrigger).toHaveBeenCalledTimes(1);
		await fireEvent.keyDown(screen.getByRole("textbox"), { key: "q" });
		expect(onTrigger).toHaveBeenCalledTimes(1);
	});
});

describe("controls", () => {
	it("sound pad: a held hotkey is released when its pad goes away", async () => {
		const onStop = vi.fn();
		const { rerender } = render(Grid, { props: holdPad({ onStop }) });
		await fireEvent.keyDown(document, { key: "a" });
		expect(onStop).not.toHaveBeenCalled();
		rerender(holdPad({ loading: true, onStop }));
		expect(onStop).toHaveBeenCalledTimes(1);
	});

	it("sound pad: a held hotkey is released when the window loses focus", async () => {
		const onStop = vi.fn();
		render(Grid, { props: holdPad({ onStop }) });
		await fireEvent.keyDown(document, { key: "a" });
		await fireEvent.blur(window);
		expect(onStop).toHaveBeenCalledTimes(1);
	});
});
