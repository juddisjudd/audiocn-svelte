<script lang="ts">
	import MusicNotesIcon from "phosphor-svelte/lib/MusicNotesIcon";
	import PauseIcon from "phosphor-svelte/lib/PauseIcon";
	import PlayIcon from "phosphor-svelte/lib/PlayIcon";
	import SkipBackIcon from "phosphor-svelte/lib/SkipBackIcon";
	import SkipForwardIcon from "phosphor-svelte/lib/SkipForwardIcon";
	import {
		AudioPlayer,
		AudioPlayerControls,
		AudioPlayerDescription,
		AudioPlayerPlay,
		AudioPlayerSeek,
		AudioPlayerSkipBack,
		AudioPlayerSkipForward,
		AudioPlayerTime,
		AudioPlayerTitle,
		AudioPlayerVolume,
	} from "#lib/components/ui/audio-player/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";

	const tracks = useDemoTracks();
	const track = $derived(tracks.current[0]);
</script>

<AudioPlayer class="w-full max-w-md flex-col items-stretch rounded-xl border p-4" src={track?.src}>
	<div class="flex items-center gap-3">
		<span
			class="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground"
		>
			<MusicNotesIcon class="size-5" />
		</span>
		<div class="flex min-w-0 flex-col">
			<AudioPlayerTitle>{track?.title ?? "Loading…"}</AudioPlayerTitle>
			<AudioPlayerDescription>{track?.artist}</AudioPlayerDescription>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<AudioPlayerTime />
		<AudioPlayerSeek />
		<AudioPlayerTime type="remaining" />
	</div>
	<div class="flex items-center justify-between">
		<AudioPlayerControls>
			<AudioPlayerSkipBack>
				<SkipBackIcon />
			</AudioPlayerSkipBack>
			<AudioPlayerPlay>
				{#snippet children({ playing })}
					{#if playing}
						<PauseIcon weight="fill" />
					{:else}
						<PlayIcon weight="fill" />
					{/if}
				{/snippet}
			</AudioPlayerPlay>
			<AudioPlayerSkipForward>
				<SkipForwardIcon />
			</AudioPlayerSkipForward>
		</AudioPlayerControls>
		<AudioPlayerVolume />
	</div>
</AudioPlayer>
