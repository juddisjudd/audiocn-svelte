---
title: Microphone Setup
description: Choose and check a microphone, with a live preview, a meter, gain, mute and a level check.
---

<script>
	import { ComponentPreview, ComponentSource, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="mic-setup-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/mic-setup
```

## What it does

- Lists microphones and asks for access when needed.
- Shows a scrolling waveform and a meter with peak hold, a scale and a clip light.
- Applies gain (−24 to +24 dB) and mute to what the meter shows.
- "Check level" listens for three seconds and says whether the level is good, too quiet, too loud or silent.

The microphone opens when the user clicks "Turn on microphone", or on mount with `autoStart`.

## Usage

```svelte
<script lang="ts">
	import { MicSetup } from "#lib/components/blocks/mic-setup/index.js";

	let deviceId = $state<string | null>(null);
	let gainDb = $state(0);
</script>

<MicSetup bind:deviceId bind:gainDb />
```

## Props

<PropsTable
	rows={[
		["deviceId", "string | null", "null", "The selected device. Bindable, for optional control."],
		["onDeviceChange", "(deviceId: string | null) => void", null, null],
		["gainDb", "number", "0", "Bindable."],
		["onGainChange", "(gainDb: number) => void", null, null],
		["muted", "boolean", "false", "Bindable."],
		["onMutedChange", "(muted: boolean) => void", null, null],
		["autoStart", "boolean", "false", "Open the microphone on mount."],
		["class", "string", null, null],
	]}
/>

## Files

<ComponentSource path="src/lib/components/blocks/mic-setup/mic-setup.svelte" />
