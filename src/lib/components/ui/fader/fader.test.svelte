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
		type FaderProps,
	} from "./index.js";

	let {
		value,
		layout = "controlled",
		...faderProps
	}: FaderProps & {
		value: number;
		/** `controlled`: a parent that never takes the new value. `full`: every part. */
		layout?: "controlled" | "full";
	} = $props();
</script>

{#if layout === "controlled"}
	<Fader bind:value={() => value, () => {}} {...faderProps} />
{:else}
	<Fader {value} {...faderProps}>
		<FaderLabel>Microphone</FaderLabel>
		<FaderReset />
		<FaderValue editable />
		<FaderTrack>
			<FaderRange />
			<FaderThumb />
		</FaderTrack>
		<FaderScale />
	</Fader>
{/if}
