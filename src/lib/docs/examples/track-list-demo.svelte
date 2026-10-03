<script lang="ts">
	import DotsThreeIcon from "phosphor-svelte/lib/DotsThreeIcon";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		TrackList,
		TrackListItem,
		TrackListItemActions,
		TrackListItemContent,
		TrackListItemDescription,
		TrackListItemDuration,
		TrackListItemIndex,
		TrackListItemTitle,
	} from "#lib/components/ui/track-list/index.js";
	import { formatTime } from "#lib/audio/time.js";

	const tracks = [
		{ artist: "audiocn", duration: 19.2, id: "night-drive", title: "Night Drive" },
		{ artist: "audiocn", duration: 24, id: "low-tide", title: "Low Tide" },
		{ artist: "audiocn", duration: 13.7, id: "arcade", title: "Arcade" },
		{ artist: "Not available", duration: 201, id: "locked", title: "Unreleased" },
	];

	let current = $state("low-tide");
	let playing = $state(true);
</script>

<TrackList class="max-w-md" variant="outline">
	{#each tracks as track, index (track.id)}
		<TrackListItem
			active={track.id === current}
			disabled={track.id === "locked"}
			onSelect={() => {
				playing = track.id === current ? !playing : true;
				current = track.id;
			}}
			playing={track.id === current && playing}
		>
			<TrackListItemIndex>{index + 1}</TrackListItemIndex>
			<TrackListItemContent>
				<TrackListItemTitle>{track.title}</TrackListItemTitle>
				<TrackListItemDescription>{track.artist}</TrackListItemDescription>
			</TrackListItemContent>
			<TrackListItemDuration>{formatTime(track.duration)}</TrackListItemDuration>
			<TrackListItemActions>
				<Button aria-label="More options for {track.title}" size="icon-xs" variant="ghost">
					<DotsThreeIcon />
				</Button>
			</TrackListItemActions>
		</TrackListItem>
	{/each}
</TrackList>
