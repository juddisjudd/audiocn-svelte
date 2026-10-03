<script lang="ts" module>
	import type { AudioPlayerButtonProps } from "./audio-player-button.svelte";

	export type AudioPlayerLoopProps = AudioPlayerButtonProps;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";

	import AudioPlayerButton from "./audio-player-button.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let { ref = $bindable(null), class: className, ...restProps }: AudioPlayerLoopProps = $props();

	const context = getAudioPlayerContext("AudioPlayerLoop");
</script>

<AudioPlayerButton
	bind:ref
	slotName="audio-player-loop"
	label={context.player.loop ? "Loop on" : "Loop off"}
	action={() => context.player.setLoop(!context.player.loop)}
	state={{ looping: context.player.loop }}
	aria-pressed={context.player.loop}
	class={cn("aria-pressed:bg-muted aria-pressed:text-primary", className)}
	{...restProps}
/>
