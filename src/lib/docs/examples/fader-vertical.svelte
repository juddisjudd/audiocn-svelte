<script lang="ts">
	import {
		Fader,
		FaderLabel,
		FaderRange,
		FaderScale,
		FaderThumb,
		FaderTrack,
		FaderValue,
	} from "#lib/components/ui/fader/index.js";

	const channels = ["Mic", "Music", "Game"];

	let levels = $state<Record<string, number>>({
		Game: -12,
		Mic: 0,
		Music: -18,
	});
</script>

<div class="flex h-64 gap-6">
	{#each channels as channel (channel)}
		<Fader
			class="flex-col items-center"
			orientation="vertical"
			taper="audio"
			variant="console"
			bind:value={levels[channel]}
		>
			<FaderValue />
			<div class="flex min-h-0 flex-1 gap-1">
				<FaderTrack>
					<FaderRange />
					<FaderThumb />
				</FaderTrack>
				<FaderScale />
			</div>
			<FaderLabel class="text-xs text-muted-foreground">{channel}</FaderLabel>
		</Fader>
	{/each}
</div>
