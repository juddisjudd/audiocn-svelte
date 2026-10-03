import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { SystemAudioMixer } from "./index.js";

describe("SystemAudioMixer", () => {
	beforeAll(() => {
		vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
	});

	it("shows a strip for each chosen source and the master", () => {
		render(SystemAudioMixer, { props: { sources: ["music", "sounds"] } });
		expect(screen.getByRole("group", { name: "Music" })).toBeInTheDocument();
		expect(screen.getByRole("group", { name: "Sounds" })).toBeInTheDocument();
		expect(screen.queryByRole("group", { name: "Microphone" })).not.toBeInTheDocument();
		expect(screen.getByRole("group", { name: "Master" })).toBeInTheDocument();
	});

	it("mutes a channel from its mute toggle", async () => {
		render(SystemAudioMixer, { props: { sources: ["music"] } });
		const mute = screen.getByRole("button", { name: "Mute Music" });
		await fireEvent.click(mute);
		expect(mute).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByRole("group", { name: "Music" })).toHaveAttribute("data-muted");
	});

	it("switches between rows and console strips", async () => {
		render(SystemAudioMixer, { props: { sources: ["music"] } });
		const mixer = screen.getByRole("group", { name: "Audio mixer" });
		expect(mixer).toHaveAttribute("data-orientation", "horizontal");
		await fireEvent.mouseDown(screen.getByRole("tab", { name: "Console" }));
		await fireEvent.click(screen.getByRole("tab", { name: "Console" }));
		expect(mixer).toHaveAttribute("data-orientation", "vertical");
	});
});
