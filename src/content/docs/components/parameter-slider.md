---
title: Parameter Slider
description: A labelled slider with a numeric input, unit, marks and reset, for everything that is not a volume.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="parameter-slider-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/parameter-slider
```

## Usage

```svelte
<script lang="ts">
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderHeader,
		ParameterSliderInput,
		ParameterSliderLabel,
	} from "#lib/components/ui/parameter-slider/index.js";

	let ms = $state(0);
</script>

<ParameterSlider min={-1000} max={1000} step={5} unit="ms" bind:value={ms}>
	<ParameterSliderHeader>
		<ParameterSliderLabel>Sync offset</ParameterSliderLabel>
		<ParameterSliderInput />
	</ParameterSliderHeader>
	<ParameterSliderControl />
</ParameterSlider>
```

Use it for gain trims, delays, thresholds, times and frequencies. For volume, use [Fader](/docs/components/fader).

## Anatomy

```svelte
<ParameterSlider>
	<ParameterSliderHeader>
		<ParameterSliderLabel />
		<ParameterSliderReset />
		<ParameterSliderInput />
		<ParameterSliderValue />
	</ParameterSliderHeader>
	<ParameterSliderControl />
	<ParameterSliderMarks />
	<ParameterSliderDescription />
</ParameterSlider>
```

## Examples

### Log scale with marks

<ComponentPreview name="parameter-slider-frequency" />

## Theming

| Data attribute  | Meaning                             |
| --------------- | ----------------------------------- |
| `data-modified` | The value differs from `resetValue` |
| `data-disabled` | Disabled                            |

## Accessibility

- The label names both the slider and the number input.
- `ParameterSliderDescription` describes the slider thumb.
- The same keys as the [fader](/docs/components/fader#keyboard) work on the thumb; the number input supports arrow keys and typing.
- Drag the unit next to the input to scrub the value.

## API reference

<PropsTable
	rows={[
		["value", "number", "resetValue ?? min", "Bindable."],
		[
			"onValueChange",
			"(value, details) => void",
			null,
			"details.reason: drag, keyboard, input or reset.",
		],
		[
			"onValueCommit",
			"(value) => void",
			null,
			"Fires when a drag ends, after keyboard input, typing and reset.",
		],
		["min", "number", "0", null],
		["max", "number", "100", null],
		["step", "number", "1", null],
		["largeStep", "number", "10", null],
		["unit", "string", null, 'Suffix such as "ms", "dB" or "Hz".'],
		["decimals", "number", "from step", null],
		["scale", '"linear" | "log"', '"linear"', "log suits frequency and time."],
		["origin", "number", "min", "Where the fill starts."],
		["resetValue", "number", "the first value", null],
		["marks", "{ value: number; label?: string }[]", null, "Shown by ParameterSliderMarks."],
		["format", "(value: number) => string", null, null],
		["disabled", "boolean", "false", null],
	]}
/>

### ParameterSliderInput

<PropsTable rows={[["scrub", "boolean", "true", "Drag the unit to change the value."]]} />
