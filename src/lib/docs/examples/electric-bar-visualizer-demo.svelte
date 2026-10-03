<script lang="ts">
	import { ElectricBarVisualizer } from "#lib/components/ui/electric-bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
</script>

<ElectricBarVisualizer
	aria-label="Voice activity"
	class="h-28 max-w-sm text-primary"
	source={signal.visual}
/>
