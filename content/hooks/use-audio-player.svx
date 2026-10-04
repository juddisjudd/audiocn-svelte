---
title: useAudioPlayer
description: Playback state for an audio element the hook owns.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-audio-player
```

## Usage

```svelte
<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { Waveform } from "#lib/components/ui/waveform/index.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";

	let { peaks }: { peaks: Float32Array | null } = $props();

	const player = useAudioPlayer({ src: "/episode.mp3" });
</script>

<Button onclick={player.toggle}>{player.playing ? "Pause" : "Play"}</Button>
<Waveform {peaks} duration={player.duration} time={player.time} onSeekCommit={player.seek} />
```

The hook creates and owns an `<audio>` element. Pass `player.element` to [`useAudioAnalyser`](/docs/hooks/use-audio-analyser) or [`useWebAudioMixer`](/docs/hooks/use-web-audio-mixer), and `player` to [`AudioPlayer`](/docs/components/audio-player).

Call it during component setup. The options can be a getter, such as `() => ({ src: track.src })`, so the player follows a new track. The state fields are getters, so read them from the returned object, such as `player.playing`; destructuring them loses updates. The element exists in the browser only, and stays the same for the life of the component.

## Options

<PropsTable
	rows={[
		["src", "string", null, null],
		["autoPlay / loop / muted", "boolean", "false", null],
		["volume", "number", "1", "0..1."],
		["playbackRate", "number", "1", null],
		["preload", '"none" | "metadata" | "auto"', '"metadata"', null],
		[
			"crossOrigin",
			'"anonymous" | "use-credentials"',
			null,
			"Needed to analyse audio from another origin.",
		],
		["onPlay / onPause / onEnded", "() => void", null, null],
		["onError", "(error) => void", null, null],
	]}
/>

## Returns

<PropsTable
	rows={[
		["element", "HTMLAudioElement | null", null, "Null during server rendering."],
		[
			"status",
			'"idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error"',
			null,
			null,
		],
		["playing", "boolean", null, null],
		["currentTime", "number", null, "Updates about four times a second."],
		["time", "FrameSource<number>", null, "The time on every animation frame while playing."],
		["duration / buffered", "number", null, "Seconds."],
		["volume / muted / playbackRate / loop", "number | boolean", null, "Current settings."],
		[
			"play / pause / toggle / seek",
			"() => void | (seconds) => void",
			null,
			"toggle and play return a promise.",
		],
		["setVolume / setMuted / setPlaybackRate / setLoop", "(value) => void", null, null],
	]}
/>
