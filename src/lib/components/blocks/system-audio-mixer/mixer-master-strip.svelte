<script lang="ts" module>
	import type { Mixer } from "#lib/hooks/use-mixer.svelte.js";
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";

	export interface MixerMasterStripProps {
		mixer: Mixer;
		meter: FrameSource<MeterFrame>;
	}

	const CHANNELS = [0, 1];
</script>

<script lang="ts">
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";

	import {
		ChannelStrip,
		ChannelStripControls,
		ChannelStripDescription,
		ChannelStripFader,
		ChannelStripHeader,
		ChannelStripIcon,
		ChannelStripMeter,
		ChannelStripText,
		ChannelStripTitle,
		ChannelStripValue,
	} from "#lib/components/ui/channel-strip/index.js";
	import { MuteToggle } from "#lib/components/ui/channel-toggle/index.js";
	import { Fader, FaderRange, FaderThumb, FaderTrack } from "#lib/components/ui/fader/index.js";
	import {
		LevelMeter,
		LevelMeterBar,
		LevelMeterChannel,
		LevelMeterChannels,
		LevelMeterClip,
		LevelMeterHold,
		LevelMeterTrack,
	} from "#lib/components/ui/level-meter/index.js";
	import { formatDb } from "#lib/audio/decibels.js";

	let { mixer, meter }: MixerMasterStripProps = $props();
</script>

<ChannelStrip muted={mixer.master.muted} variant="master">
	<ChannelStripHeader>
		<ChannelStripIcon>
			<SpeakerHighIcon />
		</ChannelStripIcon>
		<ChannelStripText>
			<ChannelStripTitle>Master</ChannelStripTitle>
			<ChannelStripDescription>Mix output</ChannelStripDescription>
		</ChannelStripText>
	</ChannelStripHeader>
	<ChannelStripMeter>
		<LevelMeter aria-label="Master level" class="h-full" source={meter}>
			<LevelMeterChannels>
				{#each CHANNELS as index (index)}
					<LevelMeterChannel {index}>
						<LevelMeterTrack>
							<LevelMeterBar />
							<LevelMeterHold />
						</LevelMeterTrack>
					</LevelMeterChannel>
				{/each}
			</LevelMeterChannels>
			<LevelMeterClip showCount />
		</LevelMeter>
	</ChannelStripMeter>
	<ChannelStripFader>
		<Fader
			aria-label="Master volume"
			bind:value={() => mixer.master.gainDb, (value) => mixer.setMasterGain(value)}
			max={6}
			min={-60}
			silenceAtMin
			size="sm"
			taper="audio"
		>
			<FaderTrack>
				<FaderRange />
				<FaderThumb />
			</FaderTrack>
		</Fader>
	</ChannelStripFader>
	<ChannelStripValue>
		{formatDb(mixer.master.gainDb, { floorDb: -60 })}
	</ChannelStripValue>
	<ChannelStripControls>
		<MuteToggle
			aria-label="Mute master"
			bind:pressed={() => mixer.master.muted, (value) => mixer.setMasterMuted(value)}
			size="sm"
		>
			M
		</MuteToggle>
	</ChannelStripControls>
</ChannelStrip>
