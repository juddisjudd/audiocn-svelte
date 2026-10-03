<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { SmoothWaveform } from "#lib/components/ui/smooth-waveform/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream);
	const listening = $derived(microphone.status === "active");
</script>

<div class="flex w-full max-w-lg flex-col gap-4">
	<SmoothWaveform
		aria-label="Microphone"
		class="h-28 text-primary"
		mode="scope"
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
