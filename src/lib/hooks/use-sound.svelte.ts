/* eslint-disable svelte/prefer-svelte-reactivity -- the decode cache is not reactive state. */
import { untrack } from "svelte";
import { extract, type MaybeGetter } from "runed";

import { useAudioContext } from "#lib/hooks/use-audio-context.svelte.js";
import { useGainNode } from "#lib/hooks/use-gain-node.svelte.js";
import { subscribeFrame } from "#lib/audio/frame-loop.js";
import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { FrameSource } from "#lib/audio/types.js";

const RAMP_SECONDS = 0.005;

export interface UseSoundOptions {
	/** 0..1 gain. Default 1. */
	volume?: number;
	/** Default 1. */
	playbackRate?: number;
	loop?: boolean;
	/** Restart instead of layering when played again. Default true. */
	interrupt?: boolean;
	/** Most simultaneous voices when not interrupting. Default 4. */
	maxVoices?: number;
	/**
	 * Where the sound goes. Default: the speakers. Pass `null` to route
	 * `output` yourself, for example into a mixer.
	 */
	destination?: AudioNode | null;
}

export interface SoundController {
	play: () => void;
	stop: () => void;
	readonly isPlaying: boolean;
	readonly isLoaded: boolean;
	readonly error: Error | null;
	readonly duration: number;
	/** Playback progress, 0..1, on every animation frame while playing. */
	progress: FrameSource<number>;
	/** The sound's output node. */
	output: AudioNode | null;
}

const bufferCache = new WeakMap<BaseAudioContext, Map<string, Promise<AudioBuffer>>>();

const fetchAndDecode = async (context: BaseAudioContext, src: string) => {
	const response = await fetch(src);
	if (!response.ok) {
		throw new Error(`Could not load ${src}: ${response.status}`);
	}
	const data = await response.arrayBuffer();
	return context.decodeAudioData(data);
};

/** Fetches and decodes a sound once per context. */
export const loadAudioBuffer = (context: BaseAudioContext, src: string): Promise<AudioBuffer> => {
	let cache = bufferCache.get(context);
	if (!cache) {
		cache = new Map();
		bufferCache.set(context, cache);
	}
	const cached = cache.get(src);
	if (cached) {
		return cached;
	}
	const loading = fetchAndDecode(context, src);
	cache.set(src, loading);
	const forgetOnFailure = async () => {
		try {
			await loading;
		} catch {
			cache?.delete(src);
		}
	};
	forgetOnFailure();
	return loading;
};

interface Voice {
	node: AudioBufferSourceNode;
	startedAt: number;
}

interface LoadResult {
	src: string;
	buffer: AudioBuffer | null;
	failure: Error | null;
}

/** Loads a sound by URL, or passes an `AudioBuffer` straight through. */
const useSoundBuffer = (
	context: AudioContext | null,
	src: () => string | AudioBuffer | null
): { readonly buffer: AudioBuffer | null; readonly failure: Error | null } => {
	let result = $state.raw<LoadResult | null>(null);

	$effect(() => {
		const current = src();
		if (!(context && typeof current === "string")) {
			return;
		}
		let cancelled = false;
		const load = async () => {
			try {
				const buffer = await loadAudioBuffer(context, current);
				if (!cancelled) {
					result = { buffer, failure: null, src: current };
				}
			} catch (error) {
				if (!cancelled) {
					result = {
						buffer: null,
						failure: error instanceof Error ? error : new Error(String(error)),
						src: current,
					};
				}
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	});

	const loaded = $derived.by((): Omit<LoadResult, "src"> => {
		const current = src();
		if (!current) {
			return { buffer: null, failure: null };
		}
		if (typeof current !== "string") {
			return { buffer: current, failure: null };
		}
		if (result?.src !== current) {
			return { buffer: null, failure: null };
		}
		return { buffer: result.buffer, failure: result.failure };
	});

	return {
		get buffer() {
			return loaded.buffer;
		},
		get failure() {
			return loaded.failure;
		},
	};
};

/**
 * Low-latency playback of a short sound, decoded into memory. Call it during
 * component setup.
 */
export const useSound = (
	src: MaybeGetter<string | AudioBuffer | null>,
	options: MaybeGetter<UseSoundOptions> = {}
): SoundController => {
	const { context } = useAudioContext();
	const currentSrc = $derived(extract(src));
	const loaded = useSoundBuffer(context, () => currentSrc);
	let isPlaying = $state(false);
	let voices: Voice[] = [];
	const progress = createFrameEmitter<number>();
	const output = useGainNode(() => ({
		destination: extract(options).destination,
		gain: extract(options).volume ?? 1,
		timeConstant: RAMP_SECONDS,
	}));

	const stop = () => {
		for (const voice of voices) {
			try {
				voice.node.stop();
			} catch {
				// Already stopped.
			}
		}
		voices = [];
		isPlaying = false;
	};

	const play = () =>
		untrack(() => {
			const { buffer } = loaded;
			if (!(context && buffer && output)) {
				return;
			}
			const { interrupt = true, loop = false, maxVoices = 4, playbackRate = 1 } = extract(options);
			if (context.state === "suspended") {
				context.resume();
			}
			if (interrupt) {
				stop();
			} else if (voices.length >= maxVoices) {
				voices.shift()?.node.stop();
			}
			const node = context.createBufferSource();
			node.buffer = buffer;
			node.loop = loop;
			node.playbackRate.value = playbackRate;
			node.connect(output);
			const voice: Voice = { node, startedAt: context.currentTime };
			node.addEventListener(
				"ended",
				() => {
					voices = voices.filter((item) => item !== voice);
					if (voices.length === 0) {
						isPlaying = false;
						progress.emit(0);
					}
				},
				{ once: true }
			);
			node.start();
			voices.push(voice);
			isPlaying = true;
		});

	$effect(() => {
		if (!(isPlaying && context)) {
			return;
		}
		return subscribeFrame(() => {
			// A voice keeps the loop and rate it started with.
			const latest = voices.at(-1);
			const played = latest?.node.buffer;
			if (!(latest && played)) {
				return;
			}
			const elapsed = (context.currentTime - latest.startedAt) * latest.node.playbackRate.value;
			const value = latest.node.loop
				? (elapsed % played.duration) / played.duration
				: Math.min(1, elapsed / played.duration);
			progress.emit(value);
		});
	});

	$effect(() => stop);

	return {
		get duration() {
			return loaded.buffer?.duration ?? 0;
		},
		get error() {
			return loaded.failure;
		},
		get isLoaded() {
			return loaded.buffer !== null;
		},
		get isPlaying() {
			return isPlaying;
		},
		output,
		play,
		progress,
		stop,
	};
};
