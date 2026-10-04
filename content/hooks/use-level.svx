---
title: useLevel
description: Read a meter source into Svelte state at a low rate, for labels and conditional UI.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

Meters paint every frame without Svelte state. When you need the level in your markup, for a label or to show a warning, `useLevel` samples the source a few times a second.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-level
```

## Usage

```svelte
<script lang="ts">
	import { useLevel } from "#lib/hooks/use-level.svelte.js";

	const level = useLevel(() => analyser.meter);
</script>

{#if level.zone === "clip"}
	<p>Turn your microphone down.</p>
{/if}
```

Call it during component setup. The source and the options can be getters, such as `() => ({ intervalMs })`. The returned fields are getters too: read them from the object, such as `level.peakDb`. Destructuring reads them once and loses updates.

## Options

<PropsTable
	rows={[
		["intervalMs", "number", "250", "How often the state updates."],
		["channel", 'number | "max"', '"max"', "A channel index, or the loudest channel."],
		["zones", "MeterZone[]", "DEFAULT_ZONES", "Zones used to compute zone."],
		["enabled", "boolean", "true", "Pause sampling."],
	]}
/>

## Returns

<PropsTable
	rows={[
		["peakDb", "number", null, "Peak level in dBFS. -Infinity until the first frame."],
		["rmsDb", "number | undefined", null, "RMS level in dBFS, when the source measures it."],
		["zone", '"ok" | "warn" | "clip"', null, "The zone of peakDb."],
	]}
/>
