---
title: Channel Toggle
description: Mute, solo and monitor toggle buttons with their own pressed colours.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="channel-toggle-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/channel-toggle
```

## Usage

```svelte
<script lang="ts">
	import { MuteToggle, SoloToggle } from "#lib/components/ui/channel-toggle/index.js";

	let muted = $state(false);
	let solo = $state(false);
</script>

<MuteToggle bind:pressed={muted}>M</MuteToggle>
<SoloToggle bind:pressed={solo}>S</SoloToggle>
```

The presets set the tone and a default `aria-label`. Children are a letter, a word or an icon; nothing is rendered by default. Use `ChannelToggle` with a `tone` for anything else.

## Examples

### Variants

<ComponentPreview name="channel-toggle-variants" />

## Theming

| Token or attribute                                      | Meaning                                |
| ------------------------------------------------------- | -------------------------------------- |
| `--channel-mute`, `--channel-solo`, `--channel-monitor` | Pressed colours                        |
| `aria-pressed`, `data-state="on"`                       | Pressed                                |
| `data-tone`                                             | `mute`, `solo`, `monitor` or `neutral` |

## Accessibility

Toggles are buttons with `aria-pressed`. The presets are labelled "Mute", "Solo" and "Monitor"; override `aria-label` to name the channel, such as "Mute microphone".

## API reference

<PropsTable
	rows={[
		["pressed", "boolean", "false", "Bindable."],
		["onPressedChange", "(pressed: boolean) => void", null, null],
		["tone", '"mute" | "solo" | "monitor" | "neutral"', "per export", "Colour when pressed."],
		["variant", '"default" | "outline" | "ghost"', '"default"', null],
		["size", '"sm" | "default" | "lg" | "icon"', '"default"', null],
		["disabled", "boolean", "false", "Inherited from a channel strip."],
	]}
/>
