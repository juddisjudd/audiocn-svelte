<script lang="ts">
	import { ElectricWaveform } from "#lib/components/ui/electric-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const modes = ["wave", "scope"] as const;

	const signal = useDemoSignal({ kind: "speech", seed: 4 });
</script>

<div class="grid w-full max-w-lg gap-6">
	{#each modes as mode (mode)}
		<div class="grid gap-2">
			<ElectricWaveform
				aria-label="Voice, {mode}"
				class="h-24 text-primary"
				{mode}
				source={signal.visual}
			/>
			<span class="text-center font-mono text-xs text-muted-foreground">{mode}</span>
		</div>
	{/each}
</div>
