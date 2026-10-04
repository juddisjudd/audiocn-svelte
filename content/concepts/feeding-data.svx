---
title: Feeding data
description: Every meter and visualizer accepts levels three ways, so it fits any audio source.
---

audiocn-svelte components never open a microphone or connect to Web Audio themselves. They receive levels, and they accept them three ways.

## 1. A source

A **frame source** is anything with a `subscribe` method:

```ts
interface FrameSource<T> {
	subscribe: (callback: (frame: T) => void) => () => void;
}
```

Pass one as `source` and the component subscribes and paints itself on every animation frame, without going through Svelte state. This is the fastest way, and the one to use for live audio. A meter that has settled, has gone quiet or is off screen stops requesting frames, and the next frame or value wakes it, so an idle mixer costs nothing.

```svelte
<script lang="ts">
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";

	let { stream }: { stream: MediaStream | null } = $props();

	const analyser = useAudioAnalyser(() => stream);
</script>

<LevelMeter source={analyser.meter} />
<BarVisualizer source={analyser.visual} />
```

The hooks in this library return sources, and so can your own code:

```svelte
<script lang="ts">
	import { createFrameEmitter } from "#lib/audio/frame-source.js";
	import type { MeterFrame } from "#lib/audio/types.js";

	const levels = createFrameEmitter<MeterFrame>();
	socket.on("levels", (frame) => levels.emit(frame));
</script>

<LevelMeter source={levels} />
```

## 2. Values

For data that arrives slowly, such as once a second from a server, pass plain values. The meter's ballistics still move it smoothly between updates.

```svelte
<LevelMeter peakDb={-9.1} rmsDb={-18} />
<LevelMeter channels={[{ peakDb: -12 }, { peakDb: -14 }]} />
```

## 3. A handle

If you already run your own frame loop, bind the component and call its exported `paint` function:

```svelte
<script lang="ts">
	import { LevelMeter, type LevelMeterActions } from "#lib/components/ui/level-meter/index.js";

	let meter = $state<LevelMeterActions>();

	onFrame((levels) => {
		meter?.paint({ channels: levels });
	});
</script>

<LevelMeter bind:this={meter} />
```

## Frames

```ts
interface MeterFrame {
	channels: { peakDb: number; rmsDb?: number }[];
}

interface VisualFrame {
	bands: Float32Array; // 0..1 per frequency band
	history: Float32Array; // ring of recent levels, 0..1
	historyStart: number;
	historyLength: number;
	historyUpdatedAt?: number; // newest history entry's time, in ms
	historyIntervalMs?: number; // minimum wait between history entries
	historyPreviousLevel?: number; // last entry removed from a full ring
	timeDomain?: Float32Array; // −1..1 samples
	peakDb: number;
}
```

Sources reuse their frame objects to avoid allocating on every frame. Copy a frame if you need to keep it.

For smooth `LiveWaveform` scrolling, set `historyUpdatedAt` and a positive `historyIntervalMs`. Use the same clock as `requestAnimationFrame` or `performance.now()`. Set the timestamp when you add a history entry, and set `historyIntervalMs` to the minimum wait between entries. The drawing keeps a short buffer of history snapshots and uses their timestamps to follow the actual sample cadence. Playback runs twice that interval behind the source, 100 ms with the default settings. Set `historyPreviousLevel` to the last value removed from a full ring so it can scroll out of view.

The built-in demo and analyser sources set these fields for you. After a pause or throttled frames, they append only the new sample and restart the history clock. They do not fill missed intervals with stale levels. Custom sources that omit the timing fields still work, but their history moves one step per update.

If your source uses the shared `subscribeFrame` loop from `#lib/audio/frame-loop.js`, pass `"update"` as its second argument. The loop runs source updates before canvas drawing, even when you connect a source after mounting a component.

## In Svelte state

When you need a level in your markup, for a label or a warning, use [`useLevel`](/docs/hooks/use-level). It samples a source a few times a second and returns an object with reactive getters.

```svelte
<script lang="ts">
	import { useLevel } from "#lib/hooks/use-level.svelte.js";

	const level = useLevel(() => analyser.meter);
</script>

{#if level.zone === "clip"}
	<p>Turn your microphone down.</p>
{/if}
```
