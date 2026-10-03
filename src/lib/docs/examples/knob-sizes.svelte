<script lang="ts">
	import {
		Knob,
		KnobDial,
		KnobLabel,
		KnobPointer,
		KnobRange,
		KnobTrack,
	} from "#lib/components/ui/knob/index.js";

	const sizes = ["sm", "default", "lg"] as const;
</script>

<div class="flex flex-wrap items-end justify-center gap-x-8 gap-y-6">
	{#each sizes as size (size)}
		<Knob {size} value={65}>
			<KnobDial>
				<KnobTrack />
				<KnobRange />
				<KnobPointer />
			</KnobDial>
			<KnobLabel class="text-muted-foreground">{size}</KnobLabel>
		</Knob>
	{/each}
	<Knob disabled value={30}>
		<KnobDial>
			<KnobTrack />
			<KnobRange />
			<KnobPointer />
		</KnobDial>
		<KnobLabel class="text-muted-foreground">disabled</KnobLabel>
	</Knob>
</div>
