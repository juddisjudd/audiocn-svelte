import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";

import { useMixer, type MixerState } from "#lib/hooks/use-mixer.svelte.js";
import { useWebAudioMixer } from "#lib/hooks/use-web-audio-mixer.svelte.js";
import { createFakeAudioContext } from "#test/fake-audio.js";

import HookHarness from "./hook-harness.test.svelte";

describe("useWebAudioMixer", () => {
	it("applies controlled state changes without rebuilding the graph", () => {
		const audio = createFakeAudioContext();
		const createDestination = vi.spyOn(audio.fake, "createMediaStreamDestination");
		const mixerState = $state<MixerState>({
			channels: [],
			master: { gainDb: 0, muted: false },
		});
		let enabled = $state(true);
		render(HookHarness, {
			props: {
				context: audio.context,
				setup: () => {
					const mixer = useMixer(() => ({ state: mixerState }));
					useWebAudioMixer(mixer, () => ({ enabled, inputs: {}, limiter: false }));
				},
			},
		});
		enabled = false;
		flushSync();
		enabled = true;
		flushSync();
		expect(createDestination).toHaveBeenCalledTimes(2);

		mixerState.master.gainDb = -6;
		flushSync();

		expect(createDestination).toHaveBeenCalledTimes(2);
		const masterGain = audio.gains.at(-2);
		expect(masterGain?.gain.setTargetAtTime).toHaveBeenLastCalledWith(
			expect.closeTo(0.501, 3),
			0,
			0.005
		);
	});
});
