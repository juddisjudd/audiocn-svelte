<script lang="ts">
	import { untrack } from "svelte";

	import { setAudioContext } from "#lib/hooks/use-audio-context.svelte.js";

	import { MusicPlayer, type MusicPlayerProps } from "./index.js";

	let {
		context,
		players,
	}: {
		/** Provides this context to the players, like `setAudioContext`. */
		context?: AudioContext;
		players: MusicPlayerProps[];
	} = $props();

	untrack(() => {
		if (context) {
			setAudioContext(context);
		}
	});
</script>

{#each players as player, index (index)}
	<MusicPlayer {...player} />
{/each}
