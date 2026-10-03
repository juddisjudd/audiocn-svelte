import { getContext, setContext } from "svelte";

import type { AudioPlayerController } from "#lib/hooks/use-audio-player.svelte.js";

export interface AudioPlayerContextValue {
	readonly player: AudioPlayerController;
	readonly onPrevious: (() => void) | undefined;
	readonly onNext: (() => void) | undefined;
}

const AUDIO_PLAYER_KEY = Symbol("audiocn.audio-player");

export const setAudioPlayerContext = (value: AudioPlayerContextValue): AudioPlayerContextValue =>
	setContext(AUDIO_PLAYER_KEY, value);

export const getAudioPlayerContext = (part: string): AudioPlayerContextValue => {
	const context = getContext<AudioPlayerContextValue | undefined>(AUDIO_PLAYER_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside AudioPlayer.`);
	}
	return context;
};

/**
 * The player controller of the surrounding `AudioPlayer`. It follows the
 * player's `player` prop when that changes.
 */
export const useAudioPlayerContext = (): AudioPlayerController => {
	const context = getAudioPlayerContext("useAudioPlayerContext");
	return {
		get buffered() {
			return context.player.buffered;
		},
		get currentTime() {
			return context.player.currentTime;
		},
		get duration() {
			return context.player.duration;
		},
		get element() {
			return context.player.element;
		},
		get error() {
			return context.player.error;
		},
		get loop() {
			return context.player.loop;
		},
		get muted() {
			return context.player.muted;
		},
		pause: () => context.player.pause(),
		play: () => context.player.play(),
		get playbackRate() {
			return context.player.playbackRate;
		},
		get playing() {
			return context.player.playing;
		},
		seek: (seconds) => context.player.seek(seconds),
		setLoop: (loop) => context.player.setLoop(loop),
		setMuted: (muted) => context.player.setMuted(muted),
		setPlaybackRate: (rate) => context.player.setPlaybackRate(rate),
		setVolume: (volume) => context.player.setVolume(volume),
		get status() {
			return context.player.status;
		},
		get time() {
			return context.player.time;
		},
		toggle: () => context.player.toggle(),
		get volume() {
			return context.player.volume;
		},
	};
};
