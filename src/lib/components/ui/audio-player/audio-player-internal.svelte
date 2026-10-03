<script lang="ts">
	import type { Snippet } from "svelte";

	import {
		useAudioPlayer,
		type AudioPlayerController,
		type UseAudioPlayerOptions,
	} from "#lib/hooks/use-audio-player.svelte.js";

	let {
		options,
		children,
	}: {
		options: () => UseAudioPlayerOptions;
		children: Snippet<[AudioPlayerController]>;
	} = $props();

	const player = useAudioPlayer(() => options());
</script>

{@render children(player)}
