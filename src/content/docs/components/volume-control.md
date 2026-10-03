---
title: Volume Control
description: A simple volume slider with a mute button, for players.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="volume-control-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/volume-control
```

## Usage

```svelte
<script lang="ts">
	import { VolumeControl } from "#lib/components/ui/volume-control/index.js";

	let volume = $state(1);
	let muted = $state(false);
</script>

<VolumeControl bind:value={volume} bind:muted />
```

Unlike the mixer components, the volume here runs from 0 to 1, the same as `HTMLMediaElement.volume`. The `perceptual` curve gives the slider more travel at low volumes, where ears are most sensitive. Unmuting at zero restores the last audible volume.

## Anatomy

```svelte
<VolumeControl>
	<VolumeControlMute />
	<VolumeControlSlider />
	<VolumeControlValue />
</VolumeControl>
```

## Examples

### In a popover

<ComponentPreview name="volume-control-popover" />

## Theming

The mute button has `data-level` of `muted`, `low`, `medium` or `high`, so icons can switch with CSS alone, as in the first example.

## API reference

<PropsTable
	rows={[
		["value", "number", "1", "0..1. Bindable."],
		["onValueChange", "(value) => void", null, null],
		["onValueCommit", "(value) => void", null, null],
		["muted", "boolean", "false", "Bindable."],
		["onMutedChange", "(muted) => void", null, null],
		["step", "number", "0.05", "Slider step."],
		["curve", '"linear" | "perceptual"', '"perceptual"', "How slider position maps to volume."],
		["orientation", '"horizontal" | "vertical"', '"horizontal"', null],
		["size", '"sm" | "default" | "lg"', '"default"', null],
		["disabled", "boolean", "false", null],
	]}
/>
