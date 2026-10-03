<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { ElectricBarVisualizer } from "#lib/components/ui/electric-bar-visualizer/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream);
	const listening = $derived(microphone.status === "active");
</script>

<div class="flex w-full max-w-sm flex-col gap-4">
	<ElectricBarVisualizer
		align="end"
		aria-label="Microphone"
		class="h-24 text-primary"
		idle="wave"
		source={analyser.visual}
	/>
	<Button
		class="self-start"
		onclick={() => (listening ? microphone.stop() : microphone.start())}
		size="sm"
		variant="outline"
	>
		{listening ? "Stop microphone" : "Use my microphone"}
	</Button>
</div>
