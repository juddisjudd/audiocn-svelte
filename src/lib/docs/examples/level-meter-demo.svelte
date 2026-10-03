<script lang="ts">
	import {
		LevelMeter,
		LevelMeterBar,
		LevelMeterChannel,
		LevelMeterChannels,
		LevelMeterClip,
		LevelMeterHold,
		LevelMeterScale,
		LevelMeterTrack,
		LevelMeterValue,
	} from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ channels: 2, kind: "music" });
</script>

<LevelMeter aria-label="Program level" class="max-w-md" source={signal.meter}>
	<LevelMeterChannels>
		<LevelMeterChannel index={0}>
			<LevelMeterTrack>
				<LevelMeterBar />
				<LevelMeterHold />
			</LevelMeterTrack>
		</LevelMeterChannel>
		<LevelMeterChannel index={1}>
			<LevelMeterTrack>
				<LevelMeterBar />
				<LevelMeterHold />
			</LevelMeterTrack>
		</LevelMeterChannel>
		<LevelMeterScale />
	</LevelMeterChannels>
	<LevelMeterValue />
	<LevelMeterClip />
</LevelMeter>
