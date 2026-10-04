---
title: useFrameSource
description: Subscribe a callback to a frame source, with automatic cleanup.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

Every audiocn-svelte meter and visualizer uses this hook for its `source` prop. Use it to build your own components on any frame source.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-frame-source
```

## Usage

```svelte
<script lang="ts">
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { dbToLevel } from "#lib/audio/decibels.js";
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";

	let { source }: { source: FrameSource<MeterFrame> } = $props();

	let bar = $state<HTMLDivElement | null>(null);

	useFrameSource(
		() => source,
		(frame) => {
			const level = dbToLevel(frame.channels[0]?.peakDb ?? -Infinity);
			bar?.style.setProperty("--level", String(level));
		}
	);
</script>

<div class="h-2 w-40 rounded-full bg-muted">
	<div bind:this={bar} class="h-full origin-left scale-x-(--level) rounded-full bg-primary"></div>
</div>
```

The callback runs outside Svelte's reactivity, so it can update the DOM on every frame without touching state. Call the hook during component setup, and pass the source as a getter, `() => source`, so a new source resubscribes.

## API

<PropsTable
	rows={[
		[
			"source",
			"MaybeGetter<FrameSource<T> | null | undefined>",
			null,
			"The source to subscribe to. Changing it resubscribes.",
		],
		[
			"onFrame",
			"(frame: T) => void",
			null,
			"Called for every frame. It sees current props, so it never causes a resubscribe.",
		],
		["options.enabled", "boolean", "true", "Pause the subscription without unmounting."],
	]}
/>

`options` can be an object or a getter, such as `() => ({ enabled })`.
