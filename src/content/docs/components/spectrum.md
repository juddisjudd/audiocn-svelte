---
title: Spectrum
description: A frequency spectrum analyser with axes, a grid and peak hold.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="spectrum-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/spectrum
```

## Usage

```svelte
<script lang="ts">
	import { Spectrum } from "#lib/components/ui/spectrum/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";

	let { stream }: { stream: MediaStream | null } = $props();

	const analyser = useAudioAnalyser(() => stream, { bands: 64 });
</script>

<Spectrum source={analyser.visual} />
```

The spectrum draws the frequency bands of a visual frame. Set `minHz`, `maxHz`, `minDb` and `maxDb` to match the analyser that produced them, so the axes are labelled correctly. The defaults match `useAudioAnalyser`.

## Anatomy

```svelte
<Spectrum>
	<SpectrumLevelAxis />
	<SpectrumCanvas />
	<SpectrumFrequencyAxis />
</Spectrum>
```

## Examples

### Line and area

<ComponentPreview name="spectrum-variants" />

### Microphone

<ComponentPreview name="spectrum-microphone" />

## Theming

| Variable          | Default      |
| ----------------- | ------------ |
| `--spectrum`      | `primary`    |
| `--spectrum-peak` | `foreground` |
| `--spectrum-grid` | `border`     |

## API reference

<PropsTable
	rows={[
		["source", "FrameSource<VisualFrame> | null", null, null],
		["variant", '"bars" | "line" | "area"', '"bars"', null],
		["minDb / maxDb", "number", "-100 / -30", "The level range the bands cover."],
		["minHz / maxHz", "number", "40 / 16000", "The frequency range the bands cover."],
		["scale", '"log" | "linear"', '"log"', "Frequency axis law."],
		["peakHold", "boolean", "false", "Falling peak markers."],
		["grid", "boolean", "true", null],
	]}
/>
