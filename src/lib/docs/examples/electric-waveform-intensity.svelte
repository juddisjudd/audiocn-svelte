<script lang="ts">
	import { ElectricWaveform } from "#lib/components/ui/electric-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const settings = [
		{ arcs: false, intensity: 0.15, label: "calm", sparks: false },
		{ arcs: true, intensity: 0.6, label: "default", sparks: true },
		{ arcs: true, intensity: 1, label: "charged", sparks: true },
	] as const;

	const signal = useDemoSignal({ kind: "speech", seed: 6 });
</script>

<div class="grid w-full max-w-lg gap-4">
	{#each settings as setting (setting.label)}
		<div class="grid gap-1">
			<ElectricWaveform
				arcs={setting.arcs}
				aria-label="Voice, {setting.label}"
				class="h-20 text-primary"
				intensity={setting.intensity}
				source={signal.visual}
				sparks={setting.sparks}
			/>
			<span class="text-center font-mono text-xs text-muted-foreground">{setting.label}</span>
		</div>
	{/each}
</div>
