import {
	DEMO_SOUNDS,
	DEMO_TRACKS,
	renderDemoSound,
	renderDemoTrackUrl,
	type DemoSound,
	type DemoTrack,
} from "./demo-audio.js";

export interface DemoTrackSource extends DemoTrack {
	src: string;
}

export interface DemoSoundSource extends DemoSound {
	src: AudioBuffer;
}

const renderTracks = () =>
	Promise.all(
		DEMO_TRACKS.map(async (track) => ({ ...track, src: await renderDemoTrackUrl(track.id) }))
	);

const renderSounds = () =>
	Promise.all(
		DEMO_SOUNDS.map(async (sound) => ({ ...sound, src: await renderDemoSound(sound.id) }))
	);

/** Runs `render` once in the browser and keeps its result. Call during component setup. */
const useRendered = <T>(render: () => Promise<T[]>): { readonly current: T[] } => {
	let items = $state.raw<T[]>([]);

	$effect(() => {
		let cancelled = false;
		render()
			.then((rendered) => {
				if (!cancelled) {
					items = rendered;
				}
			})
			.catch(() => {
				// Demo audio needs OfflineAudioContext; without it the preview stays empty.
			});
		return () => {
			cancelled = true;
		};
	});

	return {
		get current() {
			return items;
		},
	};
};

/** Docs only: synthesised demo tracks with object URLs. */
export const useDemoTracks = () => useRendered<DemoTrackSource>(renderTracks);

/** Docs only: synthesised demo sound effects as AudioBuffers. */
export const useDemoSounds = () => useRendered<DemoSoundSource>(renderSounds);
