<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { Spectrum } from "#lib/components/ui/spectrum/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream, {
		bands: 64,
		fftSize: 4096,
	});
	const listening = $derived(microphone.status === "active");
</script>

<div class="flex w-full max-w-lg flex-col gap-4">
	<Spectrum peakHold source={analyser.visual} />
	<Button
		class="self-start"
		onclick={listening ? microphone.stop : microphone.start}
		size="sm"
		variant="outline"
	>
		{listening ? "Stop microphone" : "Use my microphone"}
	</Button>
</div>
