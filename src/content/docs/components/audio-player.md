---
title: Audio Player
description: A composable audio player with transport, seeking, time, volume, rate, loop and keyboard shortcuts.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="audio-player-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/audio-player
```

## Usage

```svelte
<script lang="ts">
	import {
		AudioPlayer,
		AudioPlayerPlay,
		AudioPlayerSeek,
	} from "#lib/components/ui/audio-player/index.js";
</script>

<AudioPlayer src="/episode.mp3">
	<AudioPlayerPlay />
	<AudioPlayerSeek />
</AudioPlayer>
```

Every part is optional. A play button and a seek bar is a complete player. Buttons show a text label unless you pass an icon as children, so the component works with any icon set.

## Anatomy

```svelte
<AudioPlayer>
	<AudioPlayerArtwork />
	<AudioPlayerTitle />
	<AudioPlayerDescription />
	<AudioPlayerControls>
		<AudioPlayerPrevious />
		<AudioPlayerSkipBack />
		<AudioPlayerPlay />
		<AudioPlayerSkipForward />
		<AudioPlayerNext />
	</AudioPlayerControls>
	<AudioPlayerTime />
	<AudioPlayerSeek />
	<AudioPlayerTime type="remaining" />
	<AudioPlayerVolume />
	<AudioPlayerRate />
	<AudioPlayerLoop />
</AudioPlayer>
```

## Examples

### Compact

<ComponentPreview name="audio-player-compact" />

### With a waveform and a playlist

The [Music Player](/docs/blocks/music-player) block uses a [Waveform](/docs/components/waveform) as the seek bar and a [Track List](/docs/components/track-list) for the queue.

### Your own player state

Create the player with [`useAudioPlayer`](/docs/hooks/use-audio-player) and pass it in, to reach it from outside, route it into a mixer or analyse it.

```svelte
<script lang="ts">
	import { AudioPlayer } from "#lib/components/ui/audio-player/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";

	let { src }: { src: string } = $props();

	const player = useAudioPlayer(() => ({ src }));
	const analyser = useAudioAnalyser(() => player.element);
</script>

<AudioPlayer {player}>…</AudioPlayer>
```

`useAudioPlayerContext()` reads the player from inside any part. Call it during the setup of a component inside the player.

## Keyboard

While focus is inside the player:

| Key                  | Action        |
| -------------------- | ------------- |
| Space or K           | Play or pause |
| Left / Right         | Seek 5 s      |
| Shift + Left / Right | Seek 15 s     |
| Up / Down            | Volume        |
| M                    | Mute          |
| Home / End           | Start or end  |

## Theming

| Data attribute                                                                          | Meaning                       |
| --------------------------------------------------------------------------------------- | ----------------------------- |
| `data-playing`, `data-paused`, `data-loading`, `data-ended`, `data-error`, `data-muted` | Player state, on the root     |
| `data-playing`, `data-loading`                                                          | On `AudioPlayerPlay`          |
| `data-looping`                                                                          | On `AudioPlayerLoop` when on  |
| `data-dragging`                                                                         | On the seek bar while dragged |
| `data-type`                                                                             | On `AudioPlayerTime`          |

## API reference

### AudioPlayer

<PropsTable
	rows={[
		["src", "string", null, null],
		["player", "AudioPlayerController", null, "Use an external player from useAudioPlayer."],
		["autoPlay / loop / muted", "boolean", "false", null],
		["volume", "number", "1", "0..1."],
		["playbackRate", "number", "1", null],
		["preload", '"none" | "metadata" | "auto"', '"metadata"', null],
		[
			"crossOrigin",
			'"anonymous" | "use-credentials"',
			null,
			"Needed to analyse remote audio.",
		],
		["onPlay / onPause / onEnded", "() => void", null, null],
		["onTimeUpdate", "(time) => void", null, null],
		["onPrevious / onNext", "() => void", null, "Enable the previous and next buttons."],
		["onError", "(error: MediaError | null) => void", null, null],
		["shortcuts", "boolean", "true", "Keyboard shortcuts while focus is inside."],
	]}
/>

### AudioPlayerPlay

<PropsTable
	rows={[
		[
			"children",
			"Snippet<[{ playing, loading }]>",
			null,
			"An icon, or a snippet that takes the state.",
		],
	]}
/>

```svelte
<AudioPlayerPlay>
	{#snippet children({ playing })}
		{#if playing}
			<PauseIcon weight="fill" />
		{:else}
			<PlayIcon weight="fill" />
		{/if}
	{/snippet}
</AudioPlayerPlay>
```

### Buttons

`AudioPlayerPlay`, `AudioPlayerPrevious`, `AudioPlayerNext`, `AudioPlayerSkipBack`, `AudioPlayerSkipForward`, `AudioPlayerRate` and `AudioPlayerLoop` render a `<button>`.

<PropsTable
	rows={[
		[
			"child",
			"Snippet<[{ props }]>",
			null,
			"Render your own element. Spread props on it.",
		],
	]}
/>

### AudioPlayerSkipBack, AudioPlayerSkipForward

<PropsTable rows={[["seconds", "number", "10", null]]} />

### AudioPlayerSeek

<PropsTable
	rows={[
		["step / largeStep", "number", "5 / 15", "Seconds for the keyboard."],
		["disabled", "boolean", null, "Disabled until the duration is known."],
	]}
/>

### AudioPlayerTime

<PropsTable
	rows={[
		["type", '"current" | "remaining" | "duration"', '"current"', null],
		["format", "(seconds, type) => string", "formatTime", null],
	]}
/>

### AudioPlayerRate

<PropsTable rows={[["rates", "number[]", "[0.5, 0.75, 1, 1.25, 1.5, 2]", "Cycles on click."]]} />

### AudioPlayerVolume

A [`VolumeControl`](/docs/components/volume-control) bound to the player's volume and mute. It takes the same props, except `value` and `muted`.
