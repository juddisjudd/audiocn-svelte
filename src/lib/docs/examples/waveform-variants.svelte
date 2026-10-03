<script lang="ts">
	import { Waveform } from "#lib/components/ui/waveform/index.js";

	const peaks = Float32Array.from({ length: 240 }, (_, index) => {
		const envelope = Math.sin((index / 240) * Math.PI) ** 0.6;
		const detail = 0.55 + 0.45 * Math.abs(Math.sin(index * 0.37) * Math.cos(index * 0.11));
		return envelope * detail;
	});

	const variants = ["bars", "mirror", "line"] as const;
</script>

<div class="grid w-full max-w-lg gap-5">
	{#each variants as variant (variant)}
		<div class="grid gap-1.5">
			<span class="font-mono text-xs text-muted-foreground">{variant}</span>
			<Waveform
				aria-label={`${variant} waveform`}
				class="h-14"
				currentTime={12}
				duration={30}
				{peaks}
				{variant}
			/>
		</div>
	{/each}
</div>
