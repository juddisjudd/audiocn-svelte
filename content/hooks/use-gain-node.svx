---
title: useGainNode
description: A gain node on the shared AudioContext, wired from an input to a destination, with click-free level changes.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

The blocks use this hook for every level control and bus: the microphone gain in Mic Setup, the soundboard's master bus, and the output of `useSound`.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-gain-node
```

## Usage

```svelte
<script lang="ts">
	import { useGainNode } from "#lib/hooks/use-gain-node.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
	import { dbToGain } from "#lib/audio/decibels.js";

	let { gainDb }: { gainDb: number } = $props();

	const microphone = useMicrophone({ enabled: true });
	// The microphone, through a gain stage, to the speakers.
	useGainNode(() => ({ gain: dbToGain(gainDb), input: microphone.stream }));
</script>
```

Call it during component setup. Pass the options as a getter, as above, so the node follows `gain`, `input` and `destination` as they change.

## Routing

- `input` takes a `MediaStream`, which the hook wraps in a source node, or any `AudioNode`. Leave it out to feed the node yourself.
- `destination` is where the node plays. Leave it out for the speakers, pass `null` to route it yourself, or pass a node such as a mixer input or a `MediaStreamAudioDestinationNode`.
- The hook returns the node, so you can connect more to it, or pass it to `useAudioAnalyser` to meter the level after gain. It returns `null` during server rendering and in browsers without Web Audio. The node stays the same for the life of the component.

## Levels

`gain` is linear: use `dbToGain` from `#lib/audio/decibels.js` for decibels. Changes ramp with a short time constant (`timeConstant`, default 10 ms), so they never click. A new node starts at its gain instead of ramping up from unity, so a muted node is never heard as it starts.

Each connection lives in an effect and is undone on cleanup, so unmounting the component disconnects the node.

<PropsTable
	rows={[
		["input", "MediaStream | AudioNode | null", null, "What feeds the node."],
		["gain", "number", "1", "Linear gain."],
		["destination", "AudioNode | null", "the speakers", "Where the node plays; null routes nowhere."],
		["timeConstant", "number", "0.01", "Ramp time constant, in seconds."],
	]}
/>
