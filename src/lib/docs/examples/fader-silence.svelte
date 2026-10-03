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

	let volumeDb = $state(-10);
</script>

<Fader class="max-w-sm" max={6} min={-80} silenceAtMin taper="audio" bind:value={volumeDb}>
	<div class="flex items-center justify-between">
		<FaderLabel>Output</FaderLabel>
		<FaderValue />
	</div>
	<FaderTrack>
		<FaderRange />
		<FaderThumb />
	</FaderTrack>
	<FaderScale ticks={[6, 0, -10, -20, -40, -80]} />
</Fader>
