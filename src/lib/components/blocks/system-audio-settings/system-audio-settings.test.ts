import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeAudioContext } from "#test/fake-audio.js";

import { SystemAudioSettings } from "./index.js";
import SystemAudioSettingsParent from "./system-audio-settings-parent.test.svelte";

const setDisplayMedia = (getDisplayMedia: () => Promise<MediaStream>) => {
	Object.defineProperty(navigator, "mediaDevices", {
		configurable: true,
		value: {
			addEventListener: vi.fn(),
			getDisplayMedia,
			removeEventListener: vi.fn(),
		},
	});
};

const audioStream = () => {
	const track = { addEventListener: vi.fn(), stop: vi.fn() };
	return {
		getAudioTracks: () => [track],
		getTracks: () => [track],
		getVideoTracks: () => [],
	} as unknown as MediaStream;
};

describe("blocks driving Web Audio", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"MediaStream",
			class {
				readonly tracks: MediaStreamTrack[];
				constructor(tracks: MediaStreamTrack[]) {
					this.tracks = tracks;
				}
				getTracks() {
					return this.tracks;
				}
			}
		);
		vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
		vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
		vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("system audio settings: the switch restarts a capture that ended while enabled stayed true", async () => {
		const getDisplayMedia = vi.fn(() =>
			Promise.reject(new DOMException("Cancelled", "NotAllowedError"))
		);
		setDisplayMedia(getDisplayMedia);
		render(SystemAudioSettings, { props: { enabled: true, onEnabledChange: vi.fn() } });
		await waitFor(() => {
			expect(getDisplayMedia).toHaveBeenCalledTimes(1);
		});

		await fireEvent.click(await screen.findByRole("switch", { name: /capture system audio/iu }));
		await waitFor(() => {
			expect(getDisplayMedia).toHaveBeenCalledTimes(2);
		});
	});

	it("system audio settings: parent re-renders don't rebuild the live source", async () => {
		const { context, fake } = createFakeAudioContext();
		setDisplayMedia(() => Promise.resolve(audioStream()));
		const streams: (MediaStream | null)[] = [];
		render(SystemAudioSettingsParent, {
			props: { context, onStream: (stream) => streams.push(stream) },
		});
		await fireEvent.click(screen.getByRole("switch", { name: /capture system audio/iu }));
		await waitFor(() => {
			expect(fake.createMediaStreamSource).toHaveBeenCalledTimes(1);
		});
		const reported = streams.length;

		for (let tick = 0; tick < 3; tick += 1) {
			await fireEvent.click(screen.getByRole("button", { name: "Tick" }));
		}
		expect(fake.createMediaStreamSource).toHaveBeenCalledTimes(1);
		expect(streams).toHaveLength(reported);
	});
});
