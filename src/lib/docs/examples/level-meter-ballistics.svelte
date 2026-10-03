<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const presets = ["peak", "vu", "instant"] as const;

	const signal = useDemoSignal({ kind: "speech", seed: 3 });
</script>

<div class="grid w-full max-w-md gap-4">
	{#each presets as preset (preset)}
		<div class="grid grid-cols-[4rem_1fr] items-center gap-3">
			<span class="font-mono text-xs text-muted-foreground">{preset}</span>
			<LevelMeter aria-label="{preset} ballistics" ballistics={preset} source={signal.meter} />
		</div>
	{/each}
</div>
