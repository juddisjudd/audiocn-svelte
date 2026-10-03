<script lang="ts">
	import { ElectricBarVisualizer } from "#lib/components/ui/electric-bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech", seed: 8 });
</script>

<ElectricBarVisualizer
	aria-label="Assistant speaking"
	barCount={21}
	barGap={3}
	barWidth={4}
	class="h-28 max-w-md text-foreground"
	mirrored
	source={signal.visual}
/>
