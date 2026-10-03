<script lang="ts">
	import { untrack } from "svelte";

	import { setAudioContext } from "#lib/hooks/use-audio-context.svelte.js";
	import { SystemAudioSettings } from "./index.js";

	interface Props {
		context: AudioContext;
		onStream: (stream: MediaStream | null) => void;
	}

	let { context, onStream }: Props = $props();

	untrack(() => setAudioContext(context));

	let ticks = $state(0);
	// A new callback on every tick, like a React parent re-rendering.
	const report = $derived.by(() => {
		void ticks;
		return (stream: MediaStream | null) => onStream(stream);
	});
</script>

<button onclick={() => (ticks += 1)} type="button">Tick</button>
<SystemAudioSettings onStreamChange={report} />
