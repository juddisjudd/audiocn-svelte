<script lang="ts">
	import { MusicPlayer } from "#lib/components/blocks/music-player/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";

	const tracks = useDemoTracks();
</script>

{#if tracks.current.length === 0}
	<p class="text-sm text-muted-foreground">Preparing tracks…</p>
{:else}
	<MusicPlayer class="w-full max-w-md" tracks={tracks.current} />
{/if}
