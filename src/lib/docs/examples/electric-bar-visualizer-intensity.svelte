<script lang="ts">
	import { ElectricBarVisualizer } from "#lib/components/ui/electric-bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const settings = [
		{ arcs: false, intensity: 0.2, label: "calm", sparks: false },
		{ arcs: true, intensity: 0.6, label: "default", sparks: true },
		{ arcs: true, intensity: 1, label: "charged", sparks: true },
	] as const;

	const signal = useDemoSignal({ kind: "speech", seed: 5 });
</script>

<div class="grid w-full max-w-md gap-6 sm:grid-cols-3">
	{#each settings as setting (setting.label)}
		<div class="grid gap-2">
			<ElectricBarVisualizer
				arcs={setting.arcs}
				aria-label="Visualizer, {setting.label}"
				barCount={10}
				class="h-20 text-primary"
				intensity={setting.intensity}
				source={signal.visual}
				sparks={setting.sparks}
			/>
			<span class="text-center font-mono text-xs text-muted-foreground">{setting.label}</span>
		</div>
	{/each}
</div>
