<script lang="ts">
	import { untrack } from "svelte";

	import { setAudioContext } from "#lib/hooks/use-audio-context.svelte.js";

	import { Soundboard, type SoundboardProps } from "./index.js";

	let {
		context,
		...boardProps
	}: SoundboardProps & {
		/** Provides this context to the board, like `setAudioContext`. */
		context?: AudioContext;
	} = $props();

	untrack(() => {
		if (context) {
			setAudioContext(context);
		}
	});
</script>

<Soundboard {...boardProps} />
