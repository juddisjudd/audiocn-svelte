---
title: useWaveformData
description: Decode an audio file and reduce it to cached waveform peaks.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-waveform-data
```

## Usage

```svelte
<script lang="ts">
	import { Waveform } from "#lib/components/ui/waveform/index.js";
	import { useWaveformData } from "#lib/hooks/use-waveform-data.svelte.js";

	const waveform = useWaveformData("/episode.mp3", { samples: 800 });
</script>

<Waveform
	loading={waveform.status === "loading"}
	peaks={waveform.peaks}
	duration={waveform.duration}
/>
```

Call it during component setup. `src` and the options can be getters, such as `() => track.src`. The fields are getters, so read them from the returned object; destructuring them loses updates.

Peaks are the loudest sample in each slice, normalised so the loudest slice is 1. Results are cached per file and sample count. `src` can also be an `AudioBuffer`.

## Options

<PropsTable rows={[["samples", "number", "512", "How many peaks to compute."]]} />

## Returns

<PropsTable
	rows={[
		["peaks", "Float32Array | null", null, "0..1 per slice."],
		["duration", "number", null, "Seconds."],
		["status", '"idle" | "loading" | "ready" | "error"', null, null],
		["error", "Error | null", null, null],
	]}
/>

`computePeaks(buffer, samples)` is exported for use outside Svelte.
