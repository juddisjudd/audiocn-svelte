import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { MeterFrame } from "#lib/audio/types.js";
import { createFakeAudioContext } from "#test/fake-audio.js";

import Harness from "./music-player.test.svelte";

const TRACKS = [{ id: "demo", src: "demo.wav", title: "Demo" }];

describe("blocks rendered twice on one page", () => {
	it("keep every DOM id unique", () => {
		render(Harness, {
			props: {
				players: [
					{ defaultTracks: TRACKS, duckingSource: null },
					{ defaultTracks: TRACKS, duckingSource: null },
				],
			},
		});
		const ids = [...document.querySelectorAll("[id]")].map(({ id }) => id);
		expect(ids.length).toBeGreaterThan(0);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("blocks driving Web Audio", () => {
	beforeEach(() => {
		vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
		vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
		vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("music player: a duck schedules its own release, so silence brings the music back", () => {
		const { context, gains } = createFakeAudioContext();
		const voice = createFrameEmitter<MeterFrame>();
		render(Harness, {
			props: { context, players: [{ defaultTracks: TRACKS, duckingSource: voice }] },
		});
		voice.emit({ channels: [{ peakDb: -10, rmsDb: -20 }] });
		flushSync();

		const calls = gains.flatMap((node) => node.gain.setTargetAtTime.mock.calls);
		// Ducked now, and back to unity once the hold runs out with no new frame.
		expect(calls.some(([value, at]) => value < 1 && at === 0)).toBe(true);
		expect(calls.some(([value, at]) => value === 1 && at > 0)).toBe(true);
	});
});
