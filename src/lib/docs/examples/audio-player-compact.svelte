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

	const tracks = useDemoTracks();
	const track = $derived(tracks.current.at(1));
</script>

<AudioPlayer class="w-full max-w-md rounded-full border py-1 pr-3 pl-1" src={track?.src}>
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
	<AudioPlayerRate />
</AudioPlayer>
