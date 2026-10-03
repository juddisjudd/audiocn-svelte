<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";
	import { useLevel } from "#lib/hooks/use-level.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
	import { formatDb } from "#lib/audio/decibels.js";

	const demo = useDemoSignal({ kind: "speech" });
	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream);
	const listening = $derived(microphone.status === "active");

	const rows = [
		{ label: "Demo signal", level: useLevel(demo.meter, { intervalMs: 100 }) },
		{ label: "Microphone", level: useLevel(analyser.meter, { intervalMs: 100 }) },
	];
</script>

<div class="flex w-full max-w-xl flex-col gap-4">
	{#each rows as { label, level } (label)}
		<div
			class="grid grid-cols-1 items-center gap-1 font-mono text-sm tabular-nums sm:grid-cols-[8rem_1fr_1fr_4rem] sm:gap-3"
		>
			<span class="font-sans text-muted-foreground">{label}</span>
			<span>peak {formatDb(level.peakDb, { floorDb: -90 })}</span>
			<span>rms {formatDb(level.rmsDb ?? Number.NEGATIVE_INFINITY, { floorDb: -90 })}</span>
			<span class="text-muted-foreground">{level.zone}</span>
		</div>
	{/each}
	<div class="flex flex-wrap items-center gap-3">
		<Button onclick={listening ? microphone.stop : microphone.start} size="sm" variant="outline">
			{listening ? "Stop microphone" : "Use my microphone"}
		</Button>
		<span class="text-xs text-muted-foreground">Microphone: {microphone.status}</span>
	</div>
</div>
