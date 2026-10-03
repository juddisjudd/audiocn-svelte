import { cleanup, render, waitFor } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAudioPlayer, type UseAudioPlayerOptions } from "#lib/hooks/use-audio-player.svelte.js";
import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
import { useSound } from "#lib/hooks/use-sound.svelte.js";
import { useSystemAudio } from "#lib/hooks/use-system-audio.svelte.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";

import HookHarness from "./hook-harness.test.svelte";

/** Runs `hook` during a component's setup and returns what it returned. */
const renderHook = <T>(hook: () => T, context?: AudioContext) => {
	let result: T | undefined;
	const view = render(HookHarness, {
		props: {
			context,
			setup: () => {
				result = hook();
			},
		},
	});
	return { result: result as T, unmount: view.unmount };
};

const fakeStream = () => {
	const track = { addEventListener: vi.fn(), stop: vi.fn() };
	const stream = {
		getAudioTracks: () => [track],
		getTracks: () => [track],
		getVideoTracks: () => [],
	} as unknown as MediaStream;
	return { stream, track };
};

const setMediaDevices = (devices: Partial<MediaDevices>) => {
	Object.defineProperty(navigator, "mediaDevices", {
		configurable: true,
		value: {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			...devices,
		},
	});
};

const fakeNode = () => ({ connect: vi.fn(), disconnect: vi.fn() });

const renderPlayer = (initialProps: UseAudioPlayerOptions) => {
	let props = $state.raw(initialProps);
	const view = renderHook(() => useAudioPlayer(() => props));
	return {
		...view,
		rerender: (next: UseAudioPlayerOptions) => {
			props = next;
			flushSync();
		},
	};
};

describe("useMicrophone", () => {
	it("doesn't hand out the stopped stream when started again", async () => {
		const first = fakeStream();
		const getUserMedia = vi.fn(() => Promise.resolve(first.stream));
		setMediaDevices({ getUserMedia });
		const { result } = renderHook(() => useMicrophone({ enabled: true }));
		await waitFor(() => {
			expect(result.status).toBe("active");
		});

		result.stop();
		flushSync();
		expect(first.track.stop).toHaveBeenCalled();

		const second = Promise.withResolvers<MediaStream>();
		getUserMedia.mockImplementation(() => second.promise);
		await result.start();
		flushSync();
		expect(result.status).toBe("acquiring");
		expect(result.stream).toBeNull();
	});
});

describe("useAudioPlayer", () => {
	let load: ReturnType<typeof vi.spyOn>;
	let pause: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
		pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
			// jsdom has no media pipeline.
		});
		vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
	});

	afterEach(() => {
		// Unmount while play() and pause() are still mocked.
		cleanup();
		vi.restoreAllMocks();
	});

	it("keeps a volume set imperatively when another prop changes", () => {
		const { result, rerender } = renderPlayer({ muted: false, src: "a.mp3" });
		result.setVolume(0.3);
		flushSync();
		rerender({ muted: true, src: "a.mp3" });
		expect(result.element?.volume).toBeCloseTo(0.3);
		expect(result.element?.muted).toBe(true);
	});

	it("doesn't reload the track when autoPlay or preload changes", () => {
		const { rerender } = renderPlayer({ autoPlay: false, src: "a.mp3" });
		const loads = load.mock.calls.length;
		rerender({ autoPlay: true, src: "a.mp3" });
		rerender({ autoPlay: true, preload: "auto", src: "a.mp3" });
		expect(load.mock.calls.length).toBe(loads);
	});

	it("stops the old track when the source is cleared", () => {
		const { result, rerender } = renderPlayer({ src: "a.mp3" });
		const loads = load.mock.calls.length;
		rerender({});
		expect(result.element?.hasAttribute("src")).toBe(false);
		expect(load.mock.calls.length).toBe(loads + 1);
	});

	// Svelte has no <Activity>: effects never pause while state is kept.
	it.skip("pauses on an Activity hide and comes back paused, not reloaded", () => {});

	it("pauses the element on unmount", () => {
		const { result, unmount } = renderPlayer({ src: "a.mp3" });
		result.element?.dispatchEvent(new Event("playing"));
		flushSync();
		expect(result.status).toBe("playing");
		const pauses = pause.mock.calls.length;
		unmount();
		expect(pause.mock.calls.length).toBe(pauses + 1);
	});
});

describe("useSystemAudio", () => {
	beforeEach(() => {
		// jsdom has no MediaStream; the hook wraps the picked audio tracks in one.
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
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("drops a capture that arrives after stop()", async () => {
		const picked = Promise.withResolvers<MediaStream>();
		setMediaDevices({ getDisplayMedia: vi.fn(() => picked.promise) });
		const { stream, track } = fakeStream();
		const { result } = renderHook(() => useSystemAudio());

		const started = result.start();
		flushSync();
		expect(result.status).toBe("prompting");
		result.stop();
		flushSync();
		picked.resolve(stream);
		await started;
		flushSync();

		expect(track.stop).toHaveBeenCalled();
		expect(result.status).toBe("idle");
		expect(result.stream).toBeNull();
	});

	// Svelte has no <Activity>: effects never pause while state is kept.
	it.skip("comes back idle after an Activity hide, not active with a dead stream", () => {});

	it("stops the capture on unmount", async () => {
		const { stream, track } = fakeStream();
		setMediaDevices({ getDisplayMedia: vi.fn(() => Promise.resolve(stream)) });
		const { result, unmount } = renderHook(() => useSystemAudio());
		await result.start();
		flushSync();
		expect(result.status).toBe("active");

		unmount();
		expect(track.stop).toHaveBeenCalled();
		expect(result.status).toBe("idle");
		expect(result.stream).toBeNull();
	});
});

describe("useSound", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("reports progress from the voice, not from props changed mid-play", () => {
		const clock = { now: 0 };
		const context = {
			addEventListener: vi.fn(),
			createBufferSource: () => ({
				...fakeNode(),
				addEventListener: vi.fn(),
				buffer: null,
				loop: false,
				playbackRate: { value: 1 },
				start: vi.fn(),
				stop: vi.fn(),
			}),
			createGain: () => ({
				...fakeNode(),
				gain: { setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), value: 1 },
			}),
			get currentTime() {
				return clock.now;
			},
			destination: {},
			removeEventListener: vi.fn(),
			state: "running",
		} as unknown as AudioContext;
		const buffer = { duration: 1 } as AudioBuffer;
		let loop = $state(true);
		const { result } = renderHook(() => useSound(buffer, () => ({ loop })), context);
		const values: number[] = [];
		result.progress.subscribe((value) => values.push(value));

		result.play();
		flushSync();
		// The pad switches mode while the looping voice keeps playing.
		loop = false;
		flushSync();
		clock.now = 1.5;
		advance(20);
		expect(values.at(-1)).toBeCloseTo(0.5);
	});
});
