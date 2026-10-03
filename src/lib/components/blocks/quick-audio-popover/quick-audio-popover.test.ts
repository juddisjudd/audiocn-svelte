import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import { QuickAudioPopover } from "./index.js";

describe("QuickAudioPopover", () => {
	it("opens the controls from a trigger that names the microphone state", async () => {
		render(QuickAudioPopover);
		await fireEvent.click(screen.getByRole("button", { name: "Audio settings" }));
		expect(await screen.findByText("Microphone and system audio.")).toBeInTheDocument();
		// jsdom cannot capture display media.
		expect(screen.getByRole("switch", { name: "System audio" })).toBeDisabled();
	});
});
