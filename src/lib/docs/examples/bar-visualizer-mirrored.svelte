<script lang="ts">
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech", seed: 8 });
</script>

<BarVisualizer
	aria-label="Assistant speaking"
	barCount={31}
	class="h-28 max-w-md text-foreground [--bar-gap:2px] [--bar-width:4px]"
	mirrored
	source={signal.visual}
/>
