<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream, { historySize: 120 });
	const listening = $derived(microphone.status === "active");
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<LiveWaveform
		active={listening}
		aria-label="Microphone waveform"
		class="h-20"
		mode="scrolling"
		source={analyser.visual}
	/>
	<Button
		class="self-start"
		onclick={listening ? microphone.stop : microphone.start}
		size="sm"
		variant="outline"
	>
		{listening ? "Stop microphone" : "Use my microphone"}
	</Button>
</div>
