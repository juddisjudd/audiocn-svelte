<script lang="ts">
	import type { AudioPlayerController } from "#lib/hooks/use-audio-player.svelte.js";

	import { AudioPlayer, AudioPlayerPlay, AudioPlayerTime } from "./index.js";

	let {
		player,
		parts = "transport",
	}: {
		player: AudioPlayerController;
		parts?: "transport" | "focus-target";
	} = $props();
</script>

<AudioPlayer {player}>
	{#if parts === "transport"}
		<AudioPlayerPlay />
		<AudioPlayerTime />
		<AudioPlayerTime type="remaining" />
	{:else}
		<span tabindex="-1">focus target</span>
	{/if}
</AudioPlayer>
