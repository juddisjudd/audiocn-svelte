import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGainNode, type UseGainNodeOptions } from "#lib/hooks/use-gain-node.svelte.js";
import { createFakeAudioContext } from "#test/fake-audio.js";

import HookHarness from "./hook-harness.test.svelte";

const setup = () => {
	const audio = createFakeAudioContext();
	const renderGain = (initialProps: UseGainNodeOptions) => {
		let props = $state.raw(initialProps);
		let result: GainNode | null = null;
		const view = render(HookHarness, {
			props: {
				context: audio.context,
				setup: () => {
					result = useGainNode(() => props);
				},
			},
		});
		return {
			rerender: (next: UseGainNodeOptions) => {
				props = next;
				flushSync();
			},
			result: result as GainNode | null,
			unmount: view.unmount,
		};
	};
	return { audio, render: renderGain };
};

describe("useGainNode", () => {
	beforeEach(() => {
		// jsdom has no MediaStream; the hook only checks instanceof.
		vi.stubGlobal(
			"MediaStream",
			class {
				readonly id = "stream";
			}
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("starts at its gain, then ramps later changes", () => {
		const { audio, render } = setup();
		const { rerender } = render({ destination: null, gain: 0 });
		const [node] = audio.gains;
		expect(node?.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
		expect(node?.gain.setTargetAtTime).not.toHaveBeenCalled();

		rerender({ destination: null, gain: 0.5 });
		expect(node?.gain.setTargetAtTime).toHaveBeenCalledWith(0.5, 0, 0.01);
	});

	it("wires a stream to the speakers and undoes it on unmount", () => {
		const { audio, render } = setup();
		const stream = new MediaStream();
		const { result, unmount } = render({ input: stream });
		const node = result;
		const source = audio.fake.createMediaStreamSource.mock.results[0]?.value as {
			connect: ReturnType<typeof vi.fn>;
			disconnect: ReturnType<typeof vi.fn>;
		};
		expect(audio.fake.createMediaStreamSource).toHaveBeenCalledWith(stream);
		expect(source.connect).toHaveBeenCalledWith(node);
		expect(node?.connect).toHaveBeenCalledWith(audio.fake.destination);

		unmount();
		expect(source.disconnect).toHaveBeenCalled();
		expect(node?.disconnect).toHaveBeenCalledWith(audio.fake.destination);
	});

	it("routes nowhere with a null destination", () => {
		const { render } = setup();
		const { result } = render({ destination: null });
		expect(result?.connect).not.toHaveBeenCalled();
	});

	// Svelte has no <Activity>: effects never pause while state is kept.
	it.skip("disconnects on an Activity hide and reconnects on show", () => {});

	it("disconnects from the old destination when it changes", () => {
		const { audio, render } = setup();
		const { rerender, result } = render({ gain: 0.25 });
		const node = result;
		const bus = { connect: vi.fn(), disconnect: vi.fn() } as unknown as AudioNode;
		rerender({ destination: bus, gain: 0.25 });
		expect(node?.disconnect).toHaveBeenCalledWith(audio.fake.destination);
		expect(node?.connect).toHaveBeenCalledTimes(2);
		expect(node?.connect).toHaveBeenLastCalledWith(bus);
	});
});
