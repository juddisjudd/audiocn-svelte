---
title: Clip Indicator
description: A clip light that holds after the signal clips, with an optional count and click to reset.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="clip-indicator-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/clip-indicator
```

## Usage

```svelte
<script lang="ts">
	import { ClipIndicator } from "#lib/components/ui/clip-indicator/index.js";
</script>

<ClipIndicator source={analyser.meter} />
```

The light turns on when any channel reaches −1 dBFS and stays on for 1.5 s. Clicking it resets the light and the count. Its size never changes, so turning on never moves the layout.

## Examples

### Latching, driven by hand

Set `holdMs` to `Infinity` to keep the light on until someone resets it. Bind the component with `bind:this` and call `report` to feed levels from your own code.

<ComponentPreview name="clip-indicator-latching" />

### Controlled

Pass `clipping` when another part of your app decides whether the signal clipped.

```svelte
<ClipIndicator clipping={engine.clipped} onclick={engine.resetClip} />
```

## Theming

| Token or attribute | Meaning                    |
| ------------------ | -------------------------- |
| `--meter-clip`     | Color of the light when on |
| `data-clipping`    | The light is on            |

Children replace the default dot, so the light can be a word, an icon or anything else. Use `group-data-clipping/clip-indicator:` to style children.

## Accessibility

- A real `<button>`. Its label changes to "Clipping. Reset clip indicator" while the light is on.
- A polite live region announces "Clipping" once per clip.

## API reference

<PropsTable
	rows={[
		[
			"clipping",
			"boolean",
			null,
			"Controlled state. When set, the component does no detection.",
		],
		["source", "FrameSource<MeterFrame> | null", null, "Detects clipping from a meter source."],
		["thresholdDb", "number", "-1", "Levels at or above this count as a clip."],
		["holdMs", "number", "1500", "How long the light stays on. Infinity latches."],
		["onClippingChange", "(clipping: boolean) => void", null, null],
		["showCount", "boolean", "false", "Show the number of clips."],
		["children", "Snippet", null, "Replaces the default dot."],
		[
			"child",
			"Snippet<[{ props, clipping, count }]>",
			"<button>",
			"Renders your own element. Spread props on it.",
		],
	]}
/>

### Exported functions

Bind the component with `bind:this` to call them. Their type is `ClipIndicatorActions`.

<PropsTable
	rows={[
		["report", "(db: number) => void", null, "Feed a level reading."],
		["reset", "() => void", null, "Turn the light off and clear the count."],
	]}
/>
