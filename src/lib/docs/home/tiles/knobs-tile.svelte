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
	import { formatPan, parsePan } from "#lib/components/ui/pan-control/index.js";
	import { formatDb } from "#lib/audio/decibels.js";

	const formatHz = (hz: number) =>
		hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${Math.round(hz)}`;
</script>

<div class="flex flex-wrap items-start justify-center gap-6">
	<Knob format={(db) => formatDb(db, { decimals: 0 })} max={24} min={-24} origin={0} value={6}>
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobPointer />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Gain</KnobLabel>
	</Knob>
	<Knob format={formatPan} max={1} min={-1} origin={0} parse={parsePan} step={0.05} value={-0.25}>
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobPointer />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Pan</KnobLabel>
	</Knob>
	<Knob format={formatHz} max={20_000} min={20} scale="log" value={120}>
		<KnobDial>
			<KnobTrack />
			<KnobRange class="stroke-meter-ok" />
			<KnobPointer />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Low cut</KnobLabel>
	</Knob>
</div>
