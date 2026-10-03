---
title: Channel Strip
description: One channel of a mixer, as a row or a console strip, composed from the parts you need.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="channel-strip-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/channel-strip
```

`channel-strip` is layout and context only. Install the meters, faders and toggles you put inside it separately, or install a [block](/docs/blocks/system-audio-mixer) that brings everything.

## Usage

```svelte
<script lang="ts">
	import {
		ChannelStrip,
		ChannelStripControls,
		ChannelStripHeader,
		ChannelStripMeter,
		ChannelStripTitle,
	} from "#lib/components/ui/channel-strip/index.js";
	import { MuteToggle } from "#lib/components/ui/channel-toggle/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";

	let muted = $state(false);
</script>

<ChannelStrip {muted}>
	<ChannelStripHeader>
		<ChannelStripTitle>Microphone</ChannelStripTitle>
	</ChannelStripHeader>
	<ChannelStripMeter>
		<LevelMeter source={analyser.meter} />
	</ChannelStripMeter>
	<ChannelStripControls>
		<MuteToggle bind:pressed={muted}>M</MuteToggle>
	</ChannelStripControls>
</ChannelStrip>
```

Every part is optional. The smallest useful strip is a title, a meter and a mute toggle.

## Anatomy

```svelte
<ChannelStrip>
	<ChannelStripHeader>
		<ChannelStripIcon />
		<ChannelStripText>
			<ChannelStripTitle />
			<ChannelStripDescription />
		</ChannelStripText>
		<ChannelStripStatus />
		<ChannelStripActions />
	</ChannelStripHeader>
	<ChannelStripMeter />
	<ChannelStripFader />
	<ChannelStripValue />
	<ChannelStripControls />
	<ChannelStripNotice />
</ChannelStrip>
```

## Examples

### Console strips

With `orientation="vertical"`, the meter and fader stand side by side.

<ComponentPreview name="channel-strip-console" />

### Notices

<ComponentPreview name="channel-strip-notices" />

## How it passes settings down

A strip provides its `orientation`, `size` and `disabled` state to the audiocn-svelte components inside it, so meters and faders line up without extra props. When the strip is `muted` or `dimmed`, meters inside it render dimmed. Explicit props on a child always win. `useChannelStrip()` reads the strip's state in your own parts; call it during component setup and read its fields where you use them.

## Layout

Parts place themselves on a CSS grid by area name: `header`, `meter`, `fader`, `value`, `controls` and `notice`. The grid is the strip's `channel-strip-layout` element, so you can rearrange a strip by overriding `grid-template-areas` there, for example with `*:data-[slot=channel-strip-layout]:[grid-template-areas:…]`.

A row measures its own width with a container query. Below 36rem it puts the header on its own line, with the meter and fader full width underneath, so rows stay readable on phones and in narrow panels. From 36rem up the header sits beside the meter in a column `--channel-strip-header-width` wide. Set that variable on a mixer to align every row; the header wraps its status and actions onto a second line before it truncates the title.

`ChannelStripFader` removes the fader's end padding so its track and scale reach the meter's edges in both orientations. At minimum and maximum, the thumb's centre aligns with the track edge. For track-only faders, strips centre the visible meter and fader tracks as a group in both orientations, while keeping the fader's full thumb and pointer target.

Horizontal strips reserve a notice row only when you include `ChannelStripNotice`, so strips without a notice keep equal top and bottom spacing.

`ChannelStripValue` centres its content in vertical strips and aligns it to the right in horizontal strips.

A vertical strip keeps its width inside a mixer. When the strips do not fit, the mixer's channels scroll instead of squeezing them.

## Your own root element

Pass a `child` snippet to render the root yourself. Spread `props` on your element and `layoutProps` on the element that holds the parts:

```svelte
<ChannelStrip>
	{#snippet child({ props, layoutProps })}
		<section {...props}>
			<div {...layoutProps}>
				<ChannelStripHeader>…</ChannelStripHeader>
			</div>
		</section>
	{/snippet}
</ChannelStrip>
```

## Theming

| Variable or attribute                                                      | Meaning                                      |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| `--channel-accent`                                                         | Set by `accent`, drawn as a colour tag       |
| `--channel-strip-width`                                                    | Width of a vertical strip, default `6.5rem`  |
| `--channel-strip-header-width`                                             | Header column of a wide row, default `12rem` |
| `data-muted`, `data-solo`, `data-dimmed`, `data-selected`, `data-disabled` | Channel state                                |
| `data-clipping`                                                            | A meter inside the strip is clipping         |
| `data-orientation`, `data-variant`, `data-size`                            | Current settings                             |

## Accessibility

The strip is a `group` named by `ChannelStripTitle`. A notice is a `status`, or an `alert` for the `destructive` variant. State is never shown by colour alone: pair a muted strip with a pressed mute toggle and a status label.

## API reference

### ChannelStrip

<PropsTable
	rows={[
		[
			"orientation",
			'"horizontal" | "vertical"',
			"from Mixer",
			"Horizontal is a row; vertical is a console strip.",
		],
		["variant", '"default" | "card" | "ghost" | "master"', '"default"', null],
		["size", '"sm" | "default" | "lg"', "from Mixer", "Passed to controls inside."],
		["muted", "boolean", "false", "Styling and context only."],
		["solo", "boolean", "false", null],
		["dimmed", "boolean", "false", "Silenced by another channel's solo."],
		["selected", "boolean", "false", null],
		["disabled", "boolean", "false", "Disables every control inside."],
		["accent", "string", null, "A CSS colour for the colour tag."],
		[
			"child",
			"Snippet<[{ props, layoutProps }]>",
			"<div>",
			"Renders your own root element. Spread props on it and layoutProps on the element that holds the parts.",
		],
	]}
/>

### ChannelStripStatus

<PropsTable
	rows={[
		[
			"tone",
			'"default" | "live" | "muted" | "warning" | "error"',
			'"default"',
			"Rendered with the shadcn-svelte Badge.",
		],
	]}
/>

### ChannelStripNotice

<PropsTable
	rows={[
		[
			"variant",
			'"default" | "warning" | "destructive"',
			'"default"',
			"Children can include an action button.",
		],
	]}
/>
