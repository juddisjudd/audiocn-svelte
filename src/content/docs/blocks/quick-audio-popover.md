---
title: Quick Audio Popover
description: Microphone and system audio controls behind one toolbar button that shows a live level.
---

<script>
	import { ComponentPreview, ComponentSource, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="quick-audio-popover-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/quick-audio-popover
```

## What it does

The trigger shows the microphone state and a small live [bar visualizer](/docs/components/bar-visualizer). The popover holds the microphone select, on/off and mute buttons, and a system audio switch. Children go at the bottom, for a link to full settings.

## Props

<PropsTable
	rows={[
		["children", "Snippet", null, "Extra content at the bottom."],
		["side", '"top" | "bottom" | "left" | "right"', '"bottom"', null],
		["align", '"start" | "center" | "end"', '"center"', null],
	]}
/>

## Files

<ComponentSource path="src/lib/components/blocks/quick-audio-popover/quick-audio-popover.svelte" />
