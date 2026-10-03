<script lang="ts" module>
	import type { AudioPlayerButtonProps } from "./audio-player-button.svelte";

	export type AudioPlayerSkipProps = AudioPlayerButtonProps & {
		/** Default 10. */
		seconds?: number;
	};
</script>

<script lang="ts">
	import AudioPlayerButton from "./audio-player-button.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let { ref = $bindable(null), seconds = 10, ...restProps }: AudioPlayerSkipProps = $props();

	const context = getAudioPlayerContext("AudioPlayerSkipBack");
</script>

<AudioPlayerButton
	bind:ref
	slotName="audio-player-skip-back"
	label="Back {seconds} seconds"
	action={() => context.player.seek(context.player.currentTime - seconds)}
	{...restProps}
/>
