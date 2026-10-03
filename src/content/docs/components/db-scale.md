---
title: dB Scale
description: Tick marks and labels for a decibel range, shared by meters and faders.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="db-scale-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/db-scale
```

## Usage

```svelte
<script lang="ts">
	import { DbScale } from "#lib/components/ui/db-scale/index.js";
</script>

<DbScale minDb={-60} maxDb={6} />
```

Inside a `LevelMeter` or `Fader`, use `LevelMeterScale` or `FaderScale` instead: they take the range, orientation and taper from their parent so the ticks line up.

## Anatomy

```svelte
<DbScale>
	<DbScaleTick value={0} />
	<DbScaleTick value={-12} />
</DbScale>
```

With no children, the scale renders ticks from the `ticks` prop, or common values inside the range.

## Examples

### Vertical, with custom ticks

<ComponentPreview name="db-scale-vertical" />

## Theming

| Data attribute                  | On    | Meaning          |
| ------------------------------- | ----- | ---------------- |
| `data-orientation`, `data-side` | root  | Current settings |
| `data-major`                    | ticks | A major tick     |

Marks use `bg-border` and labels use `text-muted-foreground`.

## Accessibility

The scale is decorative (`aria-hidden`): the meter or fader it belongs to already reports its value.

## API reference

### DbScale

<PropsTable
	rows={[
		["minDb", "number", "-60", "Bottom of the range, or the surrounding meter's range."],
		["maxDb", "number", "0", "Top of the range."],
		["ticks", "number[]", null, "Tick values. Default: common values inside the range."],
		[
			"taper",
			'"linear" | "audio" | Taper',
			'"linear"',
			"Position law, so ticks line up with a fader.",
		],
		["orientation", '"horizontal" | "vertical"', '"horizontal"', null],
		["side", '"start" | "end"', '"end"', "Which side of the marks the labels sit on."],
		["labels", "boolean", "true", "Show labels."],
		["format", "(db: number) => string", null, 'Label text. Default: "+6", "0", "−12".'],
		["children", "Snippet", null, "Your own DbScaleTick parts, in place of the ticks prop."],
	]}
/>

### DbScaleTick

<PropsTable
	rows={[
		["value", "number", null, "Position in dB."],
		["major", "boolean", "true", "Major ticks have longer marks."],
		["children", "Snippet", null, "Replaces the label."],
	]}
/>
