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
	import { formatDb } from "#lib/audio/decibels.js";

	const directions = [
		{ label: "Vertical", value: "vertical" },
		{ label: "Horizontal", value: "horizontal" },
		{ label: "Circular", value: "circular" },
	] as const;
</script>

<div class="flex flex-wrap items-start justify-center gap-8">
	{#each directions as { label, value } (value)}
		<Knob
			dragDirection={value}
			format={(db) => formatDb(db, { decimals: 1 })}
			max={24}
			min={-24}
			origin={0}
			value={0}
		>
			<KnobDial>
				<KnobTrack />
				<KnobRange />
				<KnobPointer />
			</KnobDial>
			<KnobValue />
			<KnobLabel>{label}</KnobLabel>
		</Knob>
	{/each}
</div>
