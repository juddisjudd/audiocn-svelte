<script lang="ts">
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";
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

	const CHANNEL_INDEXES = [0, 1];

	const program = useDemoSignal({ channels: 2, kind: "music", seed: 4 });
	const voice = useDemoSignal({ channels: 1, kind: "speech", seed: 8 });
</script>

{#snippet meter(label: string, source: FrameSource<MeterFrame>, channels: number)}
	<div class="flex flex-col items-center gap-2">
		<LevelMeter aria-label="{label} level" class="h-56" orientation="vertical" size="lg" {source}>
			<LevelMeterChannels>
				{#each CHANNEL_INDEXES.slice(0, channels) as index (index)}
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
			<LevelMeterClip holdMs={Number.POSITIVE_INFINITY} showCount />
		</LevelMeter>
		<span class="text-xs font-medium">{label}</span>
	</div>
{/snippet}

<div class="flex w-full justify-center gap-8">
	{@render meter("Program", program.meter, 2)}
	{@render meter("Voice", voice.meter, 1)}
</div>
