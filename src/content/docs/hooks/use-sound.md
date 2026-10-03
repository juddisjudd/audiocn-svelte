---
title: useSound
description: Low-latency playback of short sounds decoded into memory.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-sound
```

## Usage

```svelte
<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { useSound } from "#lib/hooks/use-sound.svelte.js";

	const ding = useSound("/sounds/ding.mp3", { volume: 0.8 });
</script>

<Button onclick={ding.play}>Ding</Button>
```

The sound is fetched and decoded once per page, then plays instantly on every trigger. `src` can also be an `AudioBuffer` you made yourself.

Call it during component setup. `src` and the options can be getters, such as `() => sound.src` and `() => ({ volume })`. `isPlaying`, `isLoaded`, `duration` and `error` are getters, so read them from the returned object.

## Routing

By default a sound plays through the speakers. Pass `destination: null` and route `output` yourself, for example into a mixer channel:

```ts
const pad = useSound(src, { destination: null });
useWebAudioMixer(mixer, { inputs: { sounds: pad.output } });
```

## Options

<PropsTable
	rows={[
		["volume", "number", "1", "0..1 gain."],
		["playbackRate", "number", "1", null],
		["loop", "boolean", "false", null],
		["interrupt", "boolean", "true", "Restart instead of layering."],
		["maxVoices", "number", "4", "Most simultaneous voices when not interrupting."],
		["destination", "AudioNode | null", "speakers", "null leaves output unconnected."],
	]}
/>

## Returns

<PropsTable
	rows={[
		["play / stop", "() => void", null, null],
		["isPlaying / isLoaded", "boolean", null, null],
		["duration", "number", null, "Seconds."],
		["progress", "FrameSource<number>", null, "0..1 while playing."],
		["output", "AudioNode | null", null, "The sound's output node."],
		["error", "Error | null", null, null],
	]}
/>

`loadAudioBuffer(context, src)` is exported for preloading.
