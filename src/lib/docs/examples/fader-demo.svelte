<script lang="ts">
	import {
		Fader,
		FaderLabel,
		FaderRange,
		FaderReset,
		FaderScale,
		FaderThumb,
		FaderTrack,
		FaderValue,
	} from "#lib/components/ui/fader/index.js";

	let gainDb = $state(-6);
</script>

<Fader class="max-w-sm" bind:value={gainDb}>
	<div class="flex items-center gap-2">
		<FaderLabel class="mr-auto">Microphone</FaderLabel>
		<FaderReset />
		<FaderValue />
	</div>
	<FaderTrack>
		<FaderRange />
		<FaderThumb />
	</FaderTrack>
	<FaderScale />
</Fader>
