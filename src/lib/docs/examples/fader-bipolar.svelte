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

	let gainDb = $state(0);
</script>

<Fader class="max-w-sm" max={24} min={-24} origin={0} step={1} bind:value={gainDb}>
	<div class="flex items-center justify-between">
		<FaderLabel>Input gain</FaderLabel>
		<FaderValue editable />
	</div>
	<FaderTrack>
		<FaderRange />
		<FaderThumb />
	</FaderTrack>
	<FaderScale ticks={[-24, -12, 0, 12, 24]} />
</Fader>
