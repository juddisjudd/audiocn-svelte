<script lang="ts">
	import MusicNotesIcon from "phosphor-svelte/lib/MusicNotesIcon";
	import PauseIcon from "phosphor-svelte/lib/PauseIcon";
	import PlayIcon from "phosphor-svelte/lib/PlayIcon";
	import SkipBackIcon from "phosphor-svelte/lib/SkipBackIcon";
	import SkipForwardIcon from "phosphor-svelte/lib/SkipForwardIcon";
	import { formatTime } from "#lib/audio/time.js";
	import {
		AudioPlayer,
		AudioPlayerControls,
		AudioPlayerDescription,
		AudioPlayerNext,
		AudioPlayerPlay,
		AudioPlayerPrevious,
		AudioPlayerSeek,
		AudioPlayerTime,
		AudioPlayerTitle,
	} from "#lib/components/ui/audio-player/index.js";
	import {
		TrackList,
		TrackListItem,
		TrackListItemContent,
		TrackListItemDescription,
		TrackListItemDuration,
		TrackListItemIndex,
		TrackListItemTitle,
	} from "#lib/components/ui/track-list/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";

	const tracks = useDemoTracks();
	let index = $state(0);
	// Only a track the visitor picked starts on its own.
	let picked = $state(false);
	const track = $derived(tracks.current[index]);

	const go = (direction: number) => {
		const count = tracks.current.length;
		if (count === 0) {
			return;
		}
		index = (index + direction + count) % count;
		picked = true;
	};

	const player = useAudioPlayer(() => ({
		autoPlay: picked,
		onEnded: () => go(1),
		src: track?.src,
	}));

	const select = (position: number) => {
		if (position === index) {
			player.toggle();
			return;
		}
		index = position;
		picked = true;
	};
</script>

<div class="@container w-full">
	<div class="grid gap-4 @lg:grid-cols-2">
		<AudioPlayer
			class="flex-col items-stretch gap-3"
			onNext={() => go(1)}
			onPrevious={() => go(-1)}
			{player}
		>
			<div class="flex items-center gap-3">
				<span
					class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
				>
					<MusicNotesIcon class="size-5" />
				</span>
				<div class="flex min-w-0 flex-1 flex-col">
					<AudioPlayerTitle>{track?.title ?? "Loading…"}</AudioPlayerTitle>
					<AudioPlayerDescription>{track?.artist}</AudioPlayerDescription>
				</div>
			</div>
			<AudioPlayerSeek />
			<div class="flex items-center justify-between">
				<AudioPlayerTime />
				<AudioPlayerTime type="remaining" />
			</div>
			<AudioPlayerControls class="justify-center">
				<AudioPlayerPrevious>
					<SkipBackIcon />
				</AudioPlayerPrevious>
				<AudioPlayerPlay>
					{#snippet children({ playing })}
						{#if playing}
							<PauseIcon weight="fill" />
						{:else}
							<PlayIcon weight="fill" />
						{/if}
					{/snippet}
				</AudioPlayerPlay>
				<AudioPlayerNext>
					<SkipForwardIcon />
				</AudioPlayerNext>
			</AudioPlayerControls>
		</AudioPlayer>
		<TrackList variant="outline">
			{#each tracks.current as item, position (item.id)}
				<TrackListItem
					active={position === index}
					onSelect={() => select(position)}
					playing={position === index && player.playing}
				>
					<TrackListItemIndex>{position + 1}</TrackListItemIndex>
					<TrackListItemContent>
						<TrackListItemTitle>{item.title}</TrackListItemTitle>
						<TrackListItemDescription>{item.artist}</TrackListItemDescription>
					</TrackListItemContent>
					<TrackListItemDuration>{formatTime(item.duration)}</TrackListItemDuration>
				</TrackListItem>
			{/each}
		</TrackList>
	</div>
</div>
