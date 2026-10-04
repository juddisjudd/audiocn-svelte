---
title: Mixer
description: The container for channel strips, with shared meter settings and keyboard navigation.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="mixer-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/mixer
```

## Usage

```svelte
<script lang="ts">
	import { ChannelStrip } from "#lib/components/ui/channel-strip/index.js";
	import {
		Mixer,
		MixerChannels,
		MixerHeader,
		MixerMaster,
		MixerSeparator,
		MixerTitle,
	} from "#lib/components/ui/mixer/index.js";
</script>

<Mixer orientation="vertical">
	<MixerHeader>
		<MixerTitle>Audio mixer</MixerTitle>
	</MixerHeader>
	<MixerChannels>
		{#each channels as channel (channel.id)}
			<ChannelStrip>…</ChannelStrip>
		{/each}
	</MixerChannels>
	<MixerSeparator />
	<MixerMaster>
		<ChannelStrip variant="master">…</ChannelStrip>
	</MixerMaster>
</Mixer>
```

The mixer holds no audio and no state. Pair it with [`useMixer`](/docs/hooks/use-mixer) for state and [`useWebAudioMixer`](/docs/hooks/use-web-audio-mixer) for sound, or with your own engine.

## Anatomy

```svelte
<Mixer>
	<MixerHeader>
		<MixerTitle />
		<MixerActions />
	</MixerHeader>
	<MixerChannels />
	<MixerEmpty />
	<MixerSeparator />
	<MixerMaster />
</Mixer>
```

## Examples

### Console

Sixteen strips in a console. Meters paint outside Svelte's reactivity, so a full console keeps the frame rate with no component updates while it meters.

<ComponentPreview name="mixer-console" />

### Empty

<ComponentPreview name="mixer-empty" />

### A complete mixer

The [System Audio Mixer](/docs/blocks/system-audio-mixer) block is a working mixer built from these parts.

## Behaviour

- Every meter in the mixer shares `minDb`, `maxDb`, `zones` and `ballistics`, so levels compare fairly across channels.
- With focus on a control in a strip, Ctrl + arrow keys move to the same control on the neighbouring strip: left and right in a console, up and down in rows. Tab still moves through every control in order.
- `MixerChannels` scrolls along the strip axis when strips overflow; the master area stays in place.
- `MixerEmpty` appears when `MixerChannels` has no children.
- `useMixerContext()` reads the mixer's `orientation` in your own parts.

## API reference

### Mixer

<PropsTable
	rows={[
		[
			"orientation",
			'"horizontal" | "vertical"',
			'"horizontal"',
			"horizontal stacks row strips; vertical lays console strips side by side.",
		],
		["size", '"sm" | "default" | "lg"', null, "Inherited by every strip and control."],
		["minDb / maxDb", "number", "-60 / 0", "Shared meter range."],
		["zones", "MeterZone[]", "DEFAULT_ZONES", "Shared meter zones."],
		["ballistics", "BallisticsInput", '"peak"', "Shared meter movement."],
		["disabled", "boolean", "false", null],
	]}
/>

### MixerChannels

<PropsTable rows={[["scrollable", "boolean", "true", "Scroll when strips overflow."]]} />
