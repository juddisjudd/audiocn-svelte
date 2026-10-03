---
title: useClipHold
description: Clip detection with a hold time, a clip count and a reset.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

`useClipHold` powers the [clip indicator](/docs/components/clip-indicator). Feed it every level reading; it tells you when the signal clipped and keeps that state for a while so people can see it.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-clip-hold
```

## Usage

```svelte
<script lang="ts">
	import { useClipHold } from "#lib/hooks/use-clip-hold.svelte.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";

	const clip = useClipHold({ holdMs: 2000 });

	useFrameSource(
		() => analyser.meter,
		(frame) => {
			clip.report(frame.channels[0]?.peakDb ?? -Infinity);
		}
	);
</script>

{#if clip.clipping}
	<span>Clipping ({clip.count})</span>
{/if}
```

Call it during component setup. The options can be an object or a getter. Read `clipping` and `count` from the returned object: they are getters, so destructuring them loses updates.

## Options

<PropsTable
	rows={[
		["thresholdDb", "number", "-1", "Levels at or above this count as a clip."],
		[
			"holdMs",
			"number",
			"1500",
			"How long the clip state holds. Infinity latches until reset().",
		],
		["onClippingChange", "(clipping: boolean) => void", null, "Called when the state changes."],
	]}
/>

## Returns

<PropsTable
	rows={[
		["clipping", "boolean", null, "The clip state, including the hold."],
		[
			"count",
			"number",
			null,
			"Separate clips since mount or the last reset. A long clip counts once.",
		],
		["report", "(db: number) => void", null, "Feed a level reading. Cheap to call every frame."],
		["reset", "() => void", null, "Clear the state and the count."],
	]}
/>
