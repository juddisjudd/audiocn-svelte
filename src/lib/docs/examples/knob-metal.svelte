<script lang="ts">
	import {
		Knob,
		KnobCap,
		KnobDial,
		KnobLabel,
		KnobRange,
		KnobTrack,
		KnobValue,
	} from "#lib/components/ui/knob/index.js";
	import { formatPan, parsePan } from "#lib/components/ui/pan-control/index.js";
	import { formatDb } from "#lib/audio/decibels.js";

	const formatHz = (hz: number) =>
		hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${Math.round(hz)}`;

	const formatPercent = (percent: number) => `${Math.round(percent)}%`;
</script>

<div class="flex flex-wrap items-start justify-center gap-8">
	<Knob format={(db) => formatDb(db, { decimals: 0 })} max={24} min={-24} origin={0} value={0}>
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobCap variant="mini" />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Gain</KnobLabel>
	</Knob>
	<Knob format={formatPan} max={1} min={-1} origin={0} parse={parsePan} step={0.05} value={0}>
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobCap variant="mini" />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Pan</KnobLabel>
	</Knob>
	<Knob format={formatHz} max={20_000} min={20} scale="log" value={120}>
		<KnobDial>
			<KnobTrack />
			<KnobRange class="stroke-meter-ok" />
			<KnobCap variant="mini" />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Low cut</KnobLabel>
	</Knob>
	<Knob format={formatPercent} value={65}>
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobCap variant="mini" />
		</KnobDial>
		<KnobValue />
		<KnobLabel>Mix</KnobLabel>
	</Knob>
</div>
