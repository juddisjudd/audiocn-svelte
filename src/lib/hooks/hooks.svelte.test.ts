import { render, waitFor } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";
import { useClipHold } from "#lib/hooks/use-clip-hold.svelte.js";
import { createDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";
import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
import { useLevel } from "#lib/hooks/use-level.svelte.js";
import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
import {
	isChannelAudible,
	mixerReducer,
	useMixer,
	type MixerState,
} from "#lib/hooks/use-mixer.svelte.js";
import { createFrameEmitter, createFrameRelay } from "#lib/audio/frame-source.js";
import type { MeterFrame } from "#lib/audio/types.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";

import HookHarness from "./hook-harness.test.svelte";

/** Runs `hook` during a component's setup and returns what it returned. */
const renderHook = <T>(hook: () => T) => {
	let result: T | undefined;
	const view = render(HookHarness, {
		props: {
			setup: () => {
				result = hook();
			},
		},
	});
	return { result: result as T, unmount: view.unmount };
};

const baseState: MixerState = {
	channels: [
		{ gainDb: 0, id: "mic", monitor: false, muted: false, pan: 0, solo: false },
		{
			gainDb: -6,
			id: "music",
			monitor: true,
			muted: false,
			pan: 0,
			solo: false,
		},
	],
	master: { gainDb: 0, muted: false },
};

describe("mixerReducer", () => {
	it("patches one channel and clamps pan", () => {
		const next = mixerReducer(baseState, {
			id: "mic",
			patch: { pan: 3 },
			type: "channel",
		});
		expect(next.channels[0]?.pan).toBe(1);
		expect(next.channels[1]).toBe(baseState.channels[1]);
	});

	it("solos exclusively when asked", () => {
		const soloed = mixerReducer(baseState, {
			exclusive: false,
			id: "mic",
			solo: true,
			type: "solo",
		});
		const exclusive = mixerReducer(soloed, {
			exclusive: true,
			id: "music",
			solo: true,
			type: "solo",
		});
		expect(exclusive.channels.map((channel) => channel.solo)).toEqual([false, true]);
	});

	it("adds and removes channels", () => {
		const added = mixerReducer(baseState, {
			channel: { id: "system" },
			type: "add",
		});
		expect(added.channels.at(-1)).toMatchObject({
			gainDb: 0,
			id: "system",
			muted: false,
		});
		expect(mixerReducer(added, { channel: { id: "system" }, type: "add" })).toBe(added);
		expect(mixerReducer(added, { id: "mic", type: "remove" }).channels).toHaveLength(2);
	});
});

describe("isChannelAudible", () => {
	it("silences muted channels and channels outside a solo", () => {
		const muted = mixerReducer(baseState, {
			id: "mic",
			patch: { muted: true },
			type: "channel",
		});
		expect(isChannelAudible(muted, "mic")).toBe(false);
		const soloed = mixerReducer(baseState, {
			exclusive: false,
			id: "music",
			solo: true,
			type: "solo",
		});
		expect(isChannelAudible(soloed, "mic")).toBe(false);
		expect(isChannelAudible(soloed, "music")).toBe(true);
	});
});

/** In-memory storage: Node 25+ shadows jsdom's localStorage with its own, which is off by default. */
const createStorage = (): Storage => {
	const items = new Map<string, string>();
	return {
		clear: () => items.clear(),
		getItem: (key) => items.get(key) ?? null,
		key: (index) => [...items.keys()][index] ?? null,
		get length() {
			return items.size;
		},
		removeItem: (key) => {
			items.delete(key);
		},
		setItem: (key, value) => {
			items.set(key, String(value));
		},
	};
};

describe("useMixer", () => {
	beforeEach(() => {
		vi.stubGlobal("localStorage", createStorage());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("manages state and reports dimmed channels", () => {
		const { result } = renderHook(() => useMixer({ channels: [{ id: "a" }, { id: "b" }] }));
		result.setGain("a", -12);
		result.setSolo("b", true);
		flushSync();
		expect(result.channel("a")?.gainDb).toBe(-12);
		expect(result.isDimmed("a")).toBe(true);
		expect(result.isAudible("b")).toBe(true);
		result.reset();
		flushSync();
		expect(result.channel("a")?.gainDb).toBe(0);
	});

	it("works controlled", () => {
		const onStateChange = vi.fn();
		const { result } = renderHook(() => useMixer({ onStateChange, state: baseState }));
		result.setMuted("mic", true);
		flushSync();
		expect(onStateChange).toHaveBeenCalledWith(
			expect.objectContaining({
				channels: expect.arrayContaining([expect.objectContaining({ id: "mic", muted: true })]),
			})
		);
		expect(result.channel("mic")?.muted).toBe(false);
	});

	it("persists to localStorage", () => {
		const { result } = renderHook(() =>
			useMixer({ channels: [{ id: "a" }], persistKey: "test-mixer" })
		);
		result.setGain("a", -3);
		flushSync();
		const saved = JSON.parse(window.localStorage.getItem("test-mixer") ?? "{}") as MixerState;
		expect(saved.channels[0]?.gainDb).toBe(-3);
		window.localStorage.removeItem("test-mixer");
	});

	it("restores saved state on remount without overwriting it", () => {
		const options = { channels: [{ id: "a" }], persistKey: "strict-mixer" };
		const first = renderHook(() => useMixer(options));
		first.result.setGain("a", -9);
		flushSync();
		first.unmount();

		const { result } = renderHook(() => useMixer(options));
		expect(result.channel("a")?.gainDb).toBe(-9);
		const saved = JSON.parse(window.localStorage.getItem("strict-mixer") ?? "{}") as MixerState;
		expect(saved.channels[0]?.gainDb).toBe(-9);
		window.localStorage.removeItem("strict-mixer");
	});
});

describe("frame sources over time", () => {
	beforeEach(() => {
		useFakeFrames();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("useLevel samples a source at its interval", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		const { result } = renderHook(() => useLevel(emitter, { intervalMs: 100 }));
		emitter.emit({ channels: [{ peakDb: -6, rmsDb: -12 }] });
		advance(120);
		expect(result).toEqual({ peakDb: -6, rmsDb: -12, zone: "clip" });
	});

	it("useClipHold counts separate clips and releases after the hold", () => {
		const { result } = renderHook(() => useClipHold({ holdMs: 200 }));
		result.report(0);
		result.report(0);
		result.report(-20);
		result.report(-0.5);
		flushSync();
		expect(result.count).toBe(2);
		expect(result.clipping).toBe(true);
		advance(250);
		expect(result.clipping).toBe(false);
	});

	// Svelte has no <Activity>: effects never pause while state is kept.
	it.skip("useClipHold releases after an Activity hide and show mid-hold", () => {});

	it("useFrameSource hands frames to the latest callback without resubscribing", () => {
		const emitter = createFrameEmitter<number>();
		const subscribe = vi.fn((listener: (frame: number) => void) => emitter.subscribe(listener));
		const source = { subscribe };
		const seen: string[] = [];
		let label = $state("first");
		renderHook(() => useFrameSource(source, (frame) => seen.push(`${label}:${frame}`)));
		label = "second";
		flushSync();
		emitter.emit(1);
		expect(seen).toEqual(["second:1"]);
		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("useLevel keeps sampling while its caller re-renders with inline zones", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		let renders = $state(0);
		// A new zones array on every update, as an inline prop would be.
		const { result } = renderHook(() =>
			useLevel(emitter, () => {
				void renders;
				return {
					intervalMs: 250,
					zones: [{ fromDb: Number.NEGATIVE_INFINITY, zone: "ok" }],
				};
			})
		);
		emitter.emit({ channels: [{ peakDb: -6, rmsDb: -12 }] });
		// Small steps, so each update lands between timer ticks.
		for (let step = 0; step < 6; step += 1) {
			advance(50);
			renders += 1;
			flushSync();
		}
		expect(result.peakDb).toBe(-6);
	});

	it("createDemoSignal emits frames only while subscribed", () => {
		const signal = createDemoSignal({ channels: 2, kind: "tone" });
		const listener = vi.fn();
		const unsubscribe = signal.meter.subscribe(listener);
		advance(100);
		expect(listener).toHaveBeenCalled();
		const frame = listener.mock.calls.at(-1)?.[0] as MeterFrame;
		expect(frame.channels).toHaveLength(2);
		expect(frame.channels[0]?.peakDb).toBeCloseTo(-12, 0);
		unsubscribe();
		listener.mockClear();
		advance(100);
		expect(listener).not.toHaveBeenCalled();
	});

	it("createFrameRelay keeps subscribers across source changes", () => {
		const relay = createFrameRelay<number>();
		const first = createFrameEmitter<number>();
		const second = createFrameEmitter<number>();
		const listener = vi.fn();
		relay.subscribe(listener);
		relay.setSource(first);
		first.emit(1);
		relay.setSource(second);
		first.emit(2);
		second.emit(3);
		expect(listener.mock.calls.map(([value]) => value)).toEqual([1, 3]);
	});
});

describe("browser device hooks", () => {
	const track = { addEventListener: vi.fn(), stop: vi.fn() };
	const stream = {
		getAudioTracks: () => [track],
		getTracks: () => [track],
	} as unknown as MediaStream;

	beforeEach(() => {
		Object.defineProperty(navigator, "mediaDevices", {
			configurable: true,
			value: {
				addEventListener: vi.fn(),
				enumerateDevices: vi.fn(() =>
					Promise.resolve([
						{
							deviceId: "default",
							groupId: "g",
							kind: "audioinput",
							label: "Default - Built-in",
						},
						{
							deviceId: "usb",
							groupId: "u",
							kind: "audioinput",
							label: "USB mic",
						},
						{
							deviceId: "cam",
							groupId: "c",
							kind: "videoinput",
							label: "Camera",
						},
					])
				),
				getUserMedia: vi.fn(() => Promise.resolve(stream)),
				removeEventListener: vi.fn(),
			},
		});
	});

	it("useAudioDevices lists audio inputs and marks the default", async () => {
		const { result } = renderHook(() => useAudioDevices());
		await waitFor(() => {
			expect(result.devices).toHaveLength(2);
		});
		expect(result.devices[0]).toMatchObject({
			id: "default",
			isDefault: true,
		});
		expect(result.permission).toBe("granted");
	});

	it("useMicrophone opens the device with processing off and stops it", async () => {
		const { result, unmount } = renderHook(() => useMicrophone({ deviceId: "usb", enabled: true }));
		await waitFor(() => {
			expect(result.status).toBe("active");
		});
		expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
			audio: {
				autoGainControl: false,
				deviceId: { exact: "usb" },
				echoCancellation: false,
				noiseSuppression: false,
			},
		});
		unmount();
		expect(track.stop).toHaveBeenCalled();
	});
});
