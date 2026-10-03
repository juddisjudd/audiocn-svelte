<script lang="ts">
	import AudioPlayerButton from "./audio-player-button.svelte";
	import type { AudioPlayerSkipProps } from "./audio-player-skip-back.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let { ref = $bindable(null), seconds = 10, ...restProps }: AudioPlayerSkipProps = $props();

	const context = getAudioPlayerContext("AudioPlayerSkipForward");
</script>

<AudioPlayerButton
	bind:ref
	slotName="audio-player-skip-forward"
	label="Forward {seconds} seconds"
	action={() => context.player.seek(context.player.currentTime + seconds)}
	{...restProps}
/>
