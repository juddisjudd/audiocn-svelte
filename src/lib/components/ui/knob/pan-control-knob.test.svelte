<script lang="ts">
	import { describePan, formatPan, parsePan } from "#lib/components/ui/pan-control/index.js";
	import { setAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import {
		Knob,
		KnobDial,
		KnobLabel,
		KnobPointer,
		KnobRange,
		KnobTrack,
		KnobValue,
	} from "./index.js";

	let { disabled = false }: { disabled?: boolean } = $props();

	setAudioConfig(() => (disabled ? { disabled: true } : {}));

	let pan = $state(0);
</script>

<Knob
	bind:value={pan}
	format={formatPan}
	largeStep={0.25}
	max={1}
	min={-1}
	origin={0}
	parse={parsePan}
	resetValue={0}
	step={0.05}
>
	<KnobDial aria-valuetext={describePan(pan)}>
		<KnobTrack />
		<KnobRange />
		<KnobPointer />
	</KnobDial>
	<KnobValue />
	<KnobLabel>Pan</KnobLabel>
</Knob>
