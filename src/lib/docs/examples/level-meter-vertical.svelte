<script lang="ts">
	import {
		LevelMeter,
		LevelMeterBar,
		LevelMeterChannel,
		LevelMeterChannels,
		LevelMeterHold,
		LevelMeterScale,
		LevelMeterTrack,
		LevelMeterValue,
	} from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const channels = [0, 1];

	const signal = useDemoSignal({ channels: 2, kind: "music", seed: 4 });
</script>

<LevelMeter
	aria-label="Program level"
	class="h-56"
	orientation="vertical"
	size="lg"
	source={signal.meter}
>
	<LevelMeterChannels>
		{#each channels as index (index)}
			<LevelMeterChannel {index}>
				<LevelMeterTrack>
					<LevelMeterBar />
					<LevelMeterHold />
				</LevelMeterTrack>
			</LevelMeterChannel>
		{/each}
		<LevelMeterScale />
	</LevelMeterChannels>
	<LevelMeterValue />
</LevelMeter>
