---
title: Track List
description: A list of tracks with active and playing states and arrow-key navigation.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="track-list-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/track-list
```

## Usage

```svelte
<script lang="ts">
	import {
		TrackList,
		TrackListItem,
		TrackListItemContent,
		TrackListItemIndex,
		TrackListItemTitle,
	} from "#lib/components/ui/track-list/index.js";
</script>

<TrackList>
	{#each tracks as track, index (track.id)}
		<TrackListItem
			active={track.id === current}
			onSelect={() => play(track)}
			playing={track.id === current && playing}
		>
			<TrackListItemIndex>{index + 1}</TrackListItemIndex>
			<TrackListItemContent>
				<TrackListItemTitle>{track.title}</TrackListItemTitle>
			</TrackListItemContent>
		</TrackListItem>
	{/each}
</TrackList>
```

`TrackListItemIndex` shows its children, or a small animated equaliser while the item is playing.

## Anatomy

```svelte
<TrackList>
	<TrackListItem>
		<TrackListItemIndex />
		<TrackListItemArtwork />
		<TrackListItemContent>
			<TrackListItemTitle />
			<TrackListItemDescription />
		</TrackListItemContent>
		<TrackListItemDuration />
		<TrackListItemActions />
	</TrackListItem>
</TrackList>
```

## Accessibility

- Up and Down move between items; Home and End jump; Enter or Space selects.
- The current item has `aria-current`.
- Buttons inside `TrackListItemActions` stay reachable with Tab and do not select the item.

Reordering is a recipe with your drag-and-drop library of choice, not built in.

## API reference

### TrackList

<PropsTable
	rows={[
		["size", '"sm" | "default" | "lg"', '"default"', "Row height."],
		["variant", '"default" | "outline"', '"default"', null],
	]}
/>

### TrackListItem

<PropsTable
	rows={[
		["active", "boolean", "false", "The current track."],
		["playing", "boolean", "false", "The current track, playing."],
		["disabled", "boolean", "false", null],
		["onSelect", "() => void", null, "Click, Enter or Space."],
		[
			"child",
			"Snippet<[{ props }]>",
			"<li>",
			"Renders your own element. Spread props on it.",
		],
	]}
/>
