---
title: System Audio Settings
description: Turn system audio capture on, set its level and see what the browser captures.
---

<script>
	import { ComponentPreview, ComponentSource, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="system-audio-settings-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/system-audio-settings
```

## What it does

- A switch that opens the browser's screen-share picker and keeps only the audio.
- A state label: Off, On, Choose what to share, No audio shared, Ended, Needs permission or Unsupported.
- A level control (−24 to +12 dB, default −6 dB) and a stereo meter while capture is on.
- Notices that explain what gets captured, or why nothing can be.

Use `onStreamChange` to get the captured audio after the level control.

## Usage

```svelte
<script lang="ts">
	import { SystemAudioSettings } from "#lib/components/blocks/system-audio-settings/index.js";

	let enabled = $state(false);
	let stream = $state<MediaStream | null>(null);
</script>

<SystemAudioSettings bind:enabled onStreamChange={(next) => (stream = next)} />
```

## Props

<PropsTable
	rows={[
		[
			"enabled",
			"boolean",
			null,
			"Bindable, for optional control of capture. Leave it out to let the switch decide.",
		],
		["onEnabledChange", "(enabled: boolean) => void", null, null],
		["gainDb", "number", "-6", "Bindable."],
		["onGainChange", "(gainDb: number) => void", null, null],
		[
			"onStreamChange",
			"(stream: MediaStream | null) => void",
			null,
			"The captured audio after the level control.",
		],
		["class", "string", null, null],
	]}
/>

## Files

<ComponentSource path="src/lib/components/blocks/system-audio-settings/system-audio-settings.svelte" />
