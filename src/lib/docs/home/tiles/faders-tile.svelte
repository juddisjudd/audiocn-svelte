<script lang="ts">
	import { Fader, FaderThumb, FaderTrack, FaderValue } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal, type DemoSignalKind } from "#lib/hooks/use-demo-signal.svelte.js";

	const MAX_DB = 6;
	const MIN_DB = -60;

	const strips: { label: string; kind: DemoSignalKind; seed: number; initialDb: number }[] = [
		{ initialDb: -3, kind: "music", label: "Drums", seed: 2 },
		{ initialDb: -8, kind: "noise", label: "Bass", seed: 5 },
		{ initialDb: -14, kind: "music", label: "Keys", seed: 7 },
	];

	const signals = strips.map(({ kind, seed }) => useDemoSignal({ channels: 2, kind, seed }));
	let gains = $state(strips.map((strip) => strip.initialDb));
</script>

<div class="flex w-full justify-center gap-4">
	{#each strips as { label }, index (label)}
		<div class="flex flex-col items-center gap-2">
			<Fader
				aria-label="{label} volume"
				class="h-56 flex-col items-center"
				max={MAX_DB}
				min={MIN_DB}
				orientation="vertical"
				size="lg"
				variant="console"
				bind:value={gains[index]}
			>
				<FaderValue />
				<FaderTrack class="w-6 overflow-visible bg-transparent">
					<LevelMeter
						aria-label="{label} level"
						class="absolute inset-0 h-full min-h-0"
						maxDb={MAX_DB}
						orientation="vertical"
						size="sm"
						source={signals[index]?.meter}
					/>
					<FaderThumb />
				</FaderTrack>
			</Fader>
			<span class="text-xs font-medium">{label}</span>
		</div>
	{/each}
</div>
