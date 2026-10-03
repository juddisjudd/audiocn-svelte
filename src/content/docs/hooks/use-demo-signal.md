---
title: useDemoSignal
description: A synthetic speech, music, tone or noise signal as frame sources, for previews, prototypes and tests.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

`useDemoSignal` makes meters and visualizers move without a microphone. Every preview on this site runs on it. The signal is repeatable for a given `seed`, and it only runs while something is subscribed.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-demo-signal
```

## Usage

```svelte
<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "music", channels: 2 });
</script>

<LevelMeter aria-label="Demo level" source={signal.meter} />
```

Call it during component setup. The options can be a getter, such as `() => ({ kind, playing })`; the signal follows them without being created again.

<ComponentPreview name="frame-source-demo" />

## Options

<PropsTable
	rows={[
		[
			"kind",
			'"speech" | "music" | "tone" | "noise" | "silence"',
			'"speech"',
			"What the signal sounds like.",
		],
		["channels", "number", "1", "1 for mono, 2 for stereo."],
		["seed", "number", "1", "Changes the pattern while keeping it repeatable."],
		["bands", "number", "32", "Frequency bands per visual frame."],
		["historySize", "number", "60", "Entries in the level history ring."],
		["historyIntervalMs", "number", "50", "Time between history entries."],
		["playing", "boolean", "true", "When false the signal falls silent, so meters fall."],
	]}
/>

## Returns

<PropsTable
	rows={[
		["meter", "FrameSource<MeterFrame>", null, "Peak and RMS per channel, every animation frame."],
		["visual", "FrameSource<VisualFrame>", null, "Bands, level history and time-domain samples."],
		["configure", "(options) => void", null, "Change options without creating a new signal."],
	]}
/>

Outside a component, `createDemoSignal(options)` returns the same object.
