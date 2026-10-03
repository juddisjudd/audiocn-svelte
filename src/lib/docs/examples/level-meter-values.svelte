<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";

	const levels = [
		{ label: "Quiet", peakDb: -42 },
		{ label: "Good", peakDb: -16 },
		{ label: "Hot", peakDb: -7 },
		{ label: "Clipping", peakDb: 0 },
	];
</script>

<div class="grid w-full max-w-sm gap-3">
	{#each levels as level (level.label)}
		<div class="grid grid-cols-[4.5rem_1fr] items-center gap-3">
			<span class="text-sm text-muted-foreground">{level.label}</span>
			<LevelMeter aria-label="{level.label} level" peakDb={level.peakDb} />
		</div>
	{/each}
</div>
