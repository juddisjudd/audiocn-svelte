import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import { AudioDeviceSelect } from "./index.js";

describe("AudioDeviceSelect", () => {
	it("shows the selected device", () => {
		render(AudioDeviceSelect, {
			devices: [
				{ id: "default", label: "Built-in" },
				{ id: "usb", label: "USB mic" },
			],
			value: "usb",
		});
		expect(screen.getByRole("combobox")).toHaveTextContent("USB mic");
	});

	it("keeps a disconnected device visible", () => {
		render(AudioDeviceSelect, {
			devices: [{ id: "a", label: "A" }],
			value: "gone",
		});
		expect(screen.getByRole("combobox")).toHaveTextContent("Unknown device (disconnected)");
		expect(screen.getByRole("combobox")).toHaveAttribute("data-missing");
	});

	it("shows None when allowed", () => {
		render(AudioDeviceSelect, {
			allowNone: true,
			devices: [],
			noneLabel: "No microphone",
		});
		expect(screen.getByRole("combobox")).toHaveTextContent("No microphone");
	});
});
