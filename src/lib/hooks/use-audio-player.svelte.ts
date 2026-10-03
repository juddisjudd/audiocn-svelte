import { untrack } from "svelte";
import { extract, type MaybeGetter } from "runed";

import { clamp } from "#lib/audio/decibels.js";
import { subscribeFrame } from "#lib/audio/frame-loop.js";
import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { FrameSource } from "#lib/audio/types.js";

export type AudioPlayerStatus =
	"idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error";

export interface UseAudioPlayerOptions {
	src?: string;
	autoPlay?: boolean;
	loop?: boolean;
	/** 0..1. Default 1. */
	volume?: number;
	muted?: boolean;
	playbackRate?: number;
	preload?: "none" | "metadata" | "auto";
	/** Needed to analyse audio from another origin. */
	crossOrigin?: "anonymous" | "use-credentials";
	onPlay?: () => void;
	onPause?: () => void;
	onEnded?: () => void;
	onError?: (error: MediaError | null) => void;
}

export interface AudioPlayerController {
	/** The media element. Pass it to `useAudioAnalyser` or `useWebAudioMixer`. */
	readonly element: HTMLAudioElement | null;
	readonly status: AudioPlayerStatus;
	readonly playing: boolean;
	/** Updates about four times a second. Use `time` for a smooth playhead. */
	readonly currentTime: number;
	readonly duration: number;
	/** End of the buffered range, in seconds. */
	readonly buffered: number;
	readonly volume: number;
	readonly muted: boolean;
	readonly playbackRate: number;
	readonly loop: boolean;
	readonly error: MediaError | null;
	play: () => Promise<void>;
	pause: () => void;
	toggle: () => Promise<void>;
	seek: (seconds: number) => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setLoop: (loop: boolean) => void;
	/** The current time on every animation frame while playing. */
	time: FrameSource<number>;
}

const bufferedEnd = (element: HTMLAudioElement) => {
	const { buffered } = element;
	return buffered.length > 0 ? buffered.end(buffered.length - 1) : 0;
};

const safeDuration = (element: HTMLAudioElement) =>
	Number.isFinite(element.duration) ? element.duration : 0;

const tryPlay = async (audio: HTMLAudioElement) => {
	try {
		await audio.play();
	} catch {
		// Playback was refused, for example before any user gesture.
	}
};

/**
 * Playback state for an audio element the hook owns. Call it during component
 * setup. The element exists on the client only, and stays the same for the
 * life of the component.
 */
export const useAudioPlayer = (
	options: MaybeGetter<UseAudioPlayerOptions> = {}
): AudioPlayerController => {
	const element = typeof Audio === "undefined" ? null : new Audio();
	const src = $derived(extract(options).src);
	const autoPlay = $derived(extract(options).autoPlay ?? false);
	const loop = $derived(extract(options).loop ?? false);
	const volume = $derived(extract(options).volume ?? 1);
	const muted = $derived(extract(options).muted ?? false);
	const playbackRate = $derived(extract(options).playbackRate ?? 1);
	const preload = $derived(extract(options).preload ?? "metadata");
	const crossOrigin = $derived(extract(options).crossOrigin);

	const initial = untrack(() => ({ muted, playbackRate, volume }));
	let playbackStatus = $state<AudioPlayerStatus>("idle");
	let currentTime = $state(0);
	let duration = $state(0);
	let buffered = $state(0);
	let currentVolume = $state(initial.volume);
	let currentMuted = $state(initial.muted);
	let currentRate = $state(initial.playbackRate);
	let failure = $state.raw<MediaError | null>(null);
	let loopOverride = $state<boolean | null>(null);
	const time = createFrameEmitter<number>();

	// Mirrors the element's events into state.
	$effect(() => {
		if (!element) {
			return;
		}
		const sync = () => {
			buffered = bufferedEnd(element);
			currentTime = element.currentTime;
			duration = safeDuration(element);
		};
		const handlers: Record<string, () => void> = {
			canplay: () => {
				if (playbackStatus === "loading") {
					playbackStatus = "ready";
				}
			},
			durationchange: sync,
			emptied: () => {
				buffered = 0;
				currentTime = 0;
				duration = 0;
			},
			ended: () => {
				playbackStatus = "ended";
				extract(options).onEnded?.();
			},
			error: () => {
				failure = element.error;
				playbackStatus = "error";
				extract(options).onError?.(element.error);
			},
			loadedmetadata: sync,
			loadstart: () => {
				failure = null;
				playbackStatus = "loading";
			},
			pause: () => {
				if (playbackStatus !== "ended") {
					playbackStatus = "paused";
				}
				extract(options).onPause?.();
			},
			playing: () => {
				playbackStatus = "playing";
				extract(options).onPlay?.();
			},
			progress: () => {
				buffered = bufferedEnd(element);
			},
			ratechange: () => {
				currentRate = element.playbackRate;
			},
			seeked: sync,
			timeupdate: () => {
				currentTime = element.currentTime;
			},
			volumechange: () => {
				currentMuted = element.muted;
				currentVolume = element.volume;
			},
		};
		const listeners = new AbortController();
		for (const [event, handler] of Object.entries(handlers)) {
			element.addEventListener(event, handler, { signal: listeners.signal });
		}
		return () => {
			listeners.abort();
			// The player pauses on unmount, after this cleanup, so its pause event
			// never reaches us. Record it here.
			if (untrack(() => playbackStatus) === "playing") {
				playbackStatus = "paused";
			}
		};
	});

	$effect(() => () => {
		element?.pause();
	});

	$effect(() => {
		if (element) {
			element.preload = preload;
		}
	});

	$effect(() => {
		if (!element) {
			return;
		}
		const nextCrossOrigin = crossOrigin ?? null;
		const crossOriginChanged = element.crossOrigin !== nextCrossOrigin;
		element.crossOrigin = nextCrossOrigin;
		if (!src) {
			if (element.hasAttribute("src")) {
				// Removing the attribute alone keeps the old track playing.
				element.removeAttribute("src");
				element.load();
			}
			return;
		}
		if (crossOriginChanged || element.getAttribute("src") !== src) {
			element.src = src;
			element.load();
		}
		// A re-run with the same source only resumes a track that never started.
		if (untrack(() => autoPlay) && element.paused && element.currentTime === 0) {
			tryPlay(element);
		}
	});

	$effect(() => {
		if (element) {
			element.volume = clamp(volume, 0, 1);
		}
	});

	$effect(() => {
		if (element) {
			element.muted = muted;
		}
	});

	$effect(() => {
		if (element) {
			element.playbackRate = playbackRate;
		}
	});

	const effectiveLoop = $derived(loopOverride ?? loop);

	$effect(() => {
		if (element) {
			element.loop = effectiveLoop;
		}
	});

	const status = $derived<AudioPlayerStatus>(src ? playbackStatus : "idle");
	const playing = $derived(status === "playing");

	$effect(() => {
		if (!(element && playing)) {
			return;
		}
		return subscribeFrame(() => {
			time.emit(element.currentTime);
		});
	});

	const play = async () => {
		if (!element) {
			return;
		}
		if (element.ended) {
			element.currentTime = 0;
		}
		await tryPlay(element);
	};

	const pause = () => {
		element?.pause();
	};

	return {
		get buffered() {
			return buffered;
		},
		get currentTime() {
			return src ? currentTime : 0;
		},
		get duration() {
			return duration;
		},
		element,
		get error() {
			return failure;
		},
		get loop() {
			return effectiveLoop;
		},
		get muted() {
			return currentMuted;
		},
		pause,
		play,
		get playbackRate() {
			return currentRate;
		},
		get playing() {
			return playing;
		},
		seek: (seconds) => {
			if (!element) {
				return;
			}
			const target = clamp(seconds, 0, safeDuration(element) || seconds);
			element.currentTime = target;
			time.emit(target);
		},
		setLoop: (next) => {
			loopOverride = next;
		},
		setMuted: (next) => {
			if (element) {
				element.muted = next;
			}
		},
		setPlaybackRate: (next) => {
			if (element) {
				element.playbackRate = next;
			}
		},
		setVolume: (next) => {
			if (element) {
				element.volume = clamp(next, 0, 1);
			}
		},
		get status() {
			return status;
		},
		time,
		toggle: async () => {
			if (element?.paused) {
				await play();
			} else {
				pause();
			}
		},
		get volume() {
			return currentVolume;
		},
	};
};
