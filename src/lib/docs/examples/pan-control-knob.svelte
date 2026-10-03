<script lang="ts">
	import {
		Knob,
		KnobDial,
		KnobLabel,
		KnobPointer,
		KnobRange,
		KnobTrack,
		KnobValue,
	} from "#lib/components/ui/knob/index.js";
	import { describePan, formatPan, parsePan } from "#lib/components/ui/pan-control/index.js";

	let pan = $state(0);
</script>

<Knob
	format={formatPan}
	largeStep={0.25}
	max={1}
	min={-1}
	origin={0}
	parse={parsePan}
	resetValue={0}
	step={0.05}
	bind:value={pan}
>
	<KnobDial aria-valuetext={describePan(pan)}>
		<KnobTrack />
		<KnobRange />
		<KnobPointer />
	</KnobDial>
	<KnobValue />
	<KnobLabel>Pan</KnobLabel>
</Knob>
