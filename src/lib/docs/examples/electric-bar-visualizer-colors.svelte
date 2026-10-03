<script lang="ts">
	import { ElectricBarVisualizer } from "#lib/components/ui/electric-bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const colors = [
		{ class: "text-primary", label: "primary" },
		{ class: "text-meter-ok", label: "meter-ok" },
		{ class: "text-channel-solo", label: "channel-solo" },
		{ class: "text-destructive", label: "destructive" },
	] as const;

	const signal = useDemoSignal({ kind: "speech", seed: 3 });
</script>

<div class="grid w-full max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
	{#each colors as color (color.label)}
		<div class="grid gap-2">
			<ElectricBarVisualizer
				align="end"
				aria-label="Bars in {color.label}"
				barCount={9}
				class="h-20 {color.class}"
				source={signal.visual}
			/>
			<span class="text-center font-mono text-xs text-muted-foreground">{color.label}</span>
		</div>
	{/each}
</div>
