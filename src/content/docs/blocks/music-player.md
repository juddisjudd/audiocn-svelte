---
title: Music Player
description: A playlist player with a waveform seek bar, shuffle, repeat and ducking under the microphone.
---

<script>
	import { ComponentPreview, ComponentSource, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="music-player-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/music-player
```

## What it does

- A player with a [waveform](/docs/components/waveform) seek bar that shows what has played, hover time, and elapsed and remaining time.
- A [track list](/docs/components/track-list): select a track to play it; the list advances on its own.
- Shuffle, repeat all and repeat one.
- With a `duckingSource`, the music drops while the source is active, with an on/off switch and an amount. It comes back on its own when the source goes quiet or stops.

## Ducking under the microphone

<ComponentPreview name="music-player-ducking" />

## Props

<PropsTable
	rows={[
		[
			"tracks / defaultTracks",
			"{ id, title, artist?, src, artwork?, duration? }[]",
			"[]",
			"Type MusicTrack.",
		],
		["onTrackChange", "(track) => void", null, null],
		[
			"duckingSource",
			"FrameSource<MeterFrame> | null",
			null,
			"The signal that ducks the music, usually the microphone.",
		],
		["output", "AudioNode | null", "speakers", "Route the music into a mixer."],
		["class", "string", null, null],
	]}
/>

## Files

<ComponentSource path="src/lib/components/blocks/music-player/music-player.svelte" />
