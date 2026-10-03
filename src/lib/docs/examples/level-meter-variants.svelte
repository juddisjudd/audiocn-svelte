<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const variants = ["solid", "segmented", "gradient"] as const;

	const signal = useDemoSignal({ channels: 2, kind: "music", seed: 2 });
</script>

<div class="grid w-full max-w-md gap-5">
	{#each variants as variant (variant)}
		<div class="grid gap-1.5">
			<span class="text-xs text-muted-foreground">{variant}</span>
			<LevelMeter aria-label="{variant} meter" size="lg" source={signal.meter} {variant} />
		</div>
	{/each}
</div>
