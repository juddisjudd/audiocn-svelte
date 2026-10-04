---
title: useMixer
description: "Mixer state with no audio attached: gain, mute, solo, pan and monitor per channel, plus a master."
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-mixer
```

## Usage

```ts
import { useMixer } from "#lib/hooks/use-mixer.svelte.js";

const mixer = useMixer({
	channels: [{ id: "mic" }, { id: "music", gainDb: -12 }],
	persistKey: "my-app-mixer",
});

mixer.setGain("mic", -3);
mixer.setSolo("music", true, { exclusive: true });
mixer.isAudible("mic"); // false while music is soloed
```

`useMixer` only holds state. Connect it to sound with [`useWebAudioMixer`](/docs/hooks/use-web-audio-mixer), or read `mixer.state` and send it to your own engine.

Call it during component setup. `state`, `channels` and `master` are getters, so read them from the returned object; the functions read the current state too. Bind a control to a channel with a function binding:

```svelte
{#each mixer.channels as channel (channel.id)}
	<Fader
		aria-label="{channel.id} volume"
		bind:value={() => channel.gainDb, (gainDb) => mixer.setGain(channel.id, gainDb)}
	/>
{/each}
```

## Options

<PropsTable
	rows={[
		[
			"channels",
			"(Partial<MixerChannelState> & { id })[]",
			"[]",
			"Initial channels. Missing fields get defaults.",
		],
		["master", "Partial<MixerMasterState>", "{ gainDb: 0, muted: false }", null],
		["state", "MixerState", null, "Controlled state."],
		["onStateChange", "(state) => void", null, "Called after every change."],
		["persistKey", "string", null, "Save state to localStorage under this key."],
	]}
/>

`channels` and `master` set the initial state only. `state`, `onStateChange` and `persistKey` stay live when you pass the options as a getter, so a controlled mixer looks like this:

```ts
let mixerState = $state.raw<MixerState>(initialState);

const mixer = useMixer(() => ({
	state: mixerState,
	onStateChange: (next) => (mixerState = next),
}));
```

A channel is `{ id, gainDb, muted, solo, pan, monitor }`. `pan` runs from −1 to 1.

## Returns

<PropsTable
	rows={[
		["state / channels / master", "MixerState", null, "Current state."],
		["channel", "(id) => MixerChannelState | undefined", null, null],
		["setGain / setMuted / setPan / setMonitor", "(id, value) => void", null, null],
		[
			"setSolo",
			"(id, solo, { exclusive? }) => void",
			null,
			"exclusive un-solos every other channel.",
		],
		["setMasterGain / setMasterMuted", "(value) => void", null, null],
		[
			"isAudible",
			"(id) => boolean",
			null,
			"False when muted, or when another channel is soloed.",
		],
		[
			"isDimmed",
			"(id) => boolean",
			null,
			"True when silenced only by another channel's solo.",
		],
		["addChannel / removeChannel", "(channel | id) => void", null, null],
		["reset", "() => void", null, "Back to the initial state."],
	]}
/>

`mixerReducer` and `isChannelAudible` are exported for use outside Svelte.
