<script lang="ts">
	import PauseIcon from "phosphor-svelte/lib/PauseIcon";
	import PlayIcon from "phosphor-svelte/lib/PlayIcon";
	import {
		AudioPlayer,
		AudioPlayerPlay,
		AudioPlayerRate,
		AudioPlayerSeek,
		AudioPlayerTime,
	} from "#lib/components/ui/audio-player/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";

	const TRACK_INDEX = 2;

	const tracks = useDemoTracks();
	const track = $derived(tracks.current.at(TRACK_INDEX));
</script>

<AudioPlayer class="w-full rounded-full border py-1 pr-3 pl-1" src={track?.src}>
	<AudioPlayerPlay class="size-8">
		{#snippet children({ playing })}
			{#if playing}
				<PauseIcon weight="fill" />
			{:else}
				<PlayIcon weight="fill" />
			{/if}
		{/snippet}
	</AudioPlayerPlay>
	<AudioPlayerSeek />
	<AudioPlayerTime type="remaining" />
	<!-- The rate would wrap the pill in the narrowest cards. -->
	<AudioPlayerRate class="@max-2xs:hidden" />
</AudioPlayer>
