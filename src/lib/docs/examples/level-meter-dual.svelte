<script lang="ts">
	import {
		LevelMeter,
		LevelMeterBar,
		LevelMeterChannel,
		LevelMeterChannels,
		LevelMeterHold,
		LevelMeterScale,
		LevelMeterTrack,
	} from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech", seed: 7 });
</script>

<LevelMeter aria-label="Voice level" class="max-w-md" size="lg" source={signal.meter}>
	<LevelMeterChannels>
		<LevelMeterChannel>
			<LevelMeterTrack>
				<LevelMeterBar class="opacity-40" measure="peak" />
				<LevelMeterBar measure="rms" />
				<LevelMeterHold />
			</LevelMeterTrack>
		</LevelMeterChannel>
		<LevelMeterScale />
	</LevelMeterChannels>
</LevelMeter>
