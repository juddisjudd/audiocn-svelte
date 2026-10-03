import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createFakeAudioContext } from "#test/fake-audio.js";

import Harness from "./soundboard.test.svelte";

describe("blocks driving Web Audio", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("soundboard: Stop all stops every playing pad", async () => {
		const { context } = createFakeAudioContext();
		const buffer = { duration: 2 } as AudioBuffer;
		const { container } = render(Harness, {
			props: {
				context,
				defaultSounds: [
					{ id: "kick", label: "Kick", src: buffer },
					{ id: "snare", label: "Snare", src: buffer },
				],
			},
		});
		const pads = [...container.querySelectorAll("[data-sound-pad]")].slice(0, 2);
		for (const pad of pads) {
			await fireEvent.click(pad);
		}
		for (const pad of pads) {
			expect(pad).toHaveAttribute("data-playing");
		}

		await fireEvent.click(screen.getByRole("button", { name: /stop all/iu }));
		for (const pad of pads) {
			expect(pad).not.toHaveAttribute("data-playing");
		}
	});
});
