<script lang="ts">
	import { untrack } from "svelte";

	import { setAudioContext } from "#lib/hooks/use-audio-context.svelte.js";

	interface Props {
		/** Runs the hook under test during setup. */
		setup: () => void;
		/** Provides this context to the hook, like `setAudioContext`. */
		context?: AudioContext;
	}

	let props: Props = $props();

	untrack(() => {
		if (props.context) {
			setAudioContext(props.context);
		}
		props.setup();
	});
</script>
