---
title: System Audio Mixer
description: The complete mixer, with microphone, system audio, music, sound pads and a master, running on Web Audio.
full: true
---

<script>
	import { ComponentPreview, ComponentSource, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview class="p-4 sm:p-6" name="system-audio-mixer-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/system-audio-mixer
```

## What it does

- **Microphone**: choose a device, start and stop it, and see when it is live, muted or blocked.
- **System audio**: capture a screen or tab with its audio through the browser's picker, with notices when nothing was shared or the browser cannot capture.
- **Music**: play and skip tracks. Music ducks by 12 dB while the microphone is active.
- **Sounds**: a popover of sound pads with hotkeys.
- **Every channel** has a stereo meter, a fader, mute, solo and a monitor send to the speakers. Microphone monitoring is off by default to avoid feedback.
- **Master**: a limited stereo mix with a clip counter and a master fader. The mix is available as a `MediaStream` through `onOutputChange`, ready for `MediaRecorder` or WebRTC.
- **Layouts**: switch between rows and console strips.

## Console layout

<ComponentPreview class="p-4 sm:p-6" name="system-audio-mixer-console" />

## Usage

```svelte
<script lang="ts">
	import { SystemAudioMixer } from "#lib/components/blocks/system-audio-mixer/index.js";
</script>

<SystemAudioMixer
	onOutputChange={(stream) => recorder.setStream(stream)}
	persistKey="studio-mixer"
	sounds={[{ id: "ding", label: "Ding", src: "/sounds/ding.mp3", hotkey: "1" }]}
	tracks={[{ id: "intro", title: "Intro", src: "/music/intro.mp3" }]}
/>
```

## Props

<PropsTable
	rows={[
		[
			"orientation",
			'"horizontal" | "vertical"',
			'"horizontal"',
			"Rows or console strips. Bindable.",
		],
		["onOrientationChange", "(orientation) => void", null, "When the layout tabs change it."],
		[
			"sources",
			'("microphone" | "system" | "music" | "sounds")[]',
			"all four",
			"Which strips to show.",
		],
		["persistKey", "string", null, "Save mixer settings to localStorage."],
		["onOutputChange", "(stream: MediaStream | null) => void", null, "The mixed output."],
		["tracks", "{ id, title, artist?, src }[]", "[]", "Tracks for the music channel."],
		[
			"sounds",
			"{ id, label, src, hotkey?, accent? }[]",
			"[]",
			"Sounds for the sounds channel. src is a URL or an AudioBuffer.",
		],
		["class", "string", null, null],
	]}
/>

## Files

<ComponentSource path="src/lib/components/blocks/system-audio-mixer/system-audio-mixer.svelte" />

<ComponentSource path="src/lib/components/blocks/system-audio-mixer/mixer-microphone-channel.svelte" />

<ComponentSource path="src/lib/components/blocks/system-audio-mixer/mixer-source-strip.svelte" />

<ComponentSource path="src/lib/components/blocks/system-audio-mixer/mixer-master-strip.svelte" />

<ComponentSource path="src/lib/components/blocks/system-audio-mixer/mixer-pad.svelte" />
