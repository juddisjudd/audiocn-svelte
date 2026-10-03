<script lang="ts">
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
</script>

<BarVisualizer
	aria-label="Voice activity"
	class="h-24 max-w-sm text-primary"
	source={signal.visual}
/>
