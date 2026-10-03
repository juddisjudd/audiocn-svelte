<script lang="ts" module>
	import type { AudioPlayerButtonProps } from "./audio-player-button.svelte";

	export type AudioPlayerNextProps = AudioPlayerButtonProps;
</script>

<script lang="ts">
	import AudioPlayerButton from "./audio-player-button.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let { ref = $bindable(null), disabled, ...restProps }: AudioPlayerNextProps = $props();

	const context = getAudioPlayerContext("AudioPlayerNext");
</script>

<AudioPlayerButton
	bind:ref
	slotName="audio-player-next"
	label="Next"
	action={() => context.onNext?.()}
	disabled={disabled ?? !context.onNext}
	{...restProps}
/>
