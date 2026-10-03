<script lang="ts">
	import { MusicPlayer } from "#lib/components/blocks/music-player/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const tracks = useDemoTracks();
	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream);
	const listening = $derived(microphone.status === "active");
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<Button
		class="self-start"
		onclick={() => (listening ? microphone.stop() : microphone.start())}
		size="sm"
		variant="outline"
	>
		{listening ? "Stop microphone" : "Use my microphone to duck"}
	</Button>
	{#if tracks.current.length > 0}
		<MusicPlayer duckingSource={analyser.meter} tracks={tracks.current} />
	{/if}
</div>
