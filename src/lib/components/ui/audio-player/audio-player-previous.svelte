<script lang="ts" module>
	import type { AudioPlayerButtonProps } from "./audio-player-button.svelte";

	export type AudioPlayerPreviousProps = AudioPlayerButtonProps;
</script>

<script lang="ts">
	import AudioPlayerButton from "./audio-player-button.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let { ref = $bindable(null), disabled, ...restProps }: AudioPlayerPreviousProps = $props();

	const context = getAudioPlayerContext("AudioPlayerPrevious");
</script>

<AudioPlayerButton
	bind:ref
	slotName="audio-player-previous"
	label="Previous"
	action={() => context.onPrevious?.()}
	disabled={disabled ?? !context.onPrevious}
	{...restProps}
/>
