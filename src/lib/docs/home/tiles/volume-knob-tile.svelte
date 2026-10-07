<script lang="ts">
	import { Knob, KnobCap, KnobDial, KnobLabel, KnobScale } from "#lib/components/ui/knob/index.js";
</script>

<Knob class="[--knob-size:11rem]" clickSound value={33}>
	<KnobDial>
		<KnobScale labelEvery={10} majorEvery={5} ticks={100} />
		<KnobCap />
	</KnobDial>
	<KnobLabel class="sr-only">Volume</KnobLabel>
</Knob>
