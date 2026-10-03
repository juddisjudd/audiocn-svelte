<script lang="ts">
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const alignments = ["center", "end", "start"] as const;

	const signal = useDemoSignal({ kind: "music" });
</script>

<div class="grid w-full max-w-md grid-cols-3 gap-6">
	{#each alignments as align (align)}
		<div class="grid gap-2">
			<div class="rounded-lg bg-muted/40 p-2">
				<BarVisualizer
					{align}
					aria-label={`Bars aligned to ${align}`}
					barCount={12}
					class="h-16"
					source={signal.visual}
				/>
			</div>
			<span class="text-center font-mono text-xs text-muted-foreground">{align}</span>
		</div>
	{/each}
</div>
