<script lang="ts">
	import DesktopIcon from "phosphor-svelte/lib/DesktopIcon";
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import MusicNotesIcon from "phosphor-svelte/lib/MusicNotesIcon";
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import WaveformIcon from "phosphor-svelte/lib/WaveformIcon";
	import {
		ChannelStrip,
		ChannelStripControls,
		ChannelStripFader,
		ChannelStripHeader,
		ChannelStripIcon,
		ChannelStripMeter,
		ChannelStripTitle,
		ChannelStripValue,
	} from "#lib/components/ui/channel-strip/index.js";
	import { MuteToggle, SoloToggle } from "#lib/components/ui/channel-toggle/index.js";
	import { Fader } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import {
		Mixer,
		MixerChannels,
		MixerMaster,
		MixerSeparator,
	} from "#lib/components/ui/mixer/index.js";
	import { useMixer } from "#lib/hooks/use-mixer.svelte.js";
	import { formatDb } from "#lib/audio/decibels.js";
	import { useDemoMixer } from "#lib/docs/use-demo-mixer.svelte.js";

	const CHANNELS = [
		{
			channels: 1,
			gainDb: 0,
			icon: MicrophoneIcon,
			id: "mic",
			kind: "speech",
			name: "Microphone",
			title: "Mic",
		},
		{
			channels: 2,
			gainDb: -8,
			icon: DesktopIcon,
			id: "system",
			kind: "noise",
			name: "System audio",
			title: "System",
		},
		{
			channels: 2,
			gainDb: -14,
			icon: MusicNotesIcon,
			id: "music",
			kind: "music",
			name: "Music",
			title: "Music",
		},
		{
			channels: 1,
			gainDb: -4,
			icon: WaveformIcon,
			id: "sounds",
			kind: "speech",
			name: "Sounds",
			seed: 11,
			title: "Sounds",
		},
	] as const;

	const mixer = useMixer({ channels: CHANNELS.map(({ id, gainDb }) => ({ gainDb, id })) });
	const demo = useDemoMixer(CHANNELS, () => mixer.state);
	const audible = $derived(CHANNELS.some(({ id }) => mixer.isAudible(id)));
</script>

<!-- The card label titles the tile, so the mixer is named here instead of
pointing at a MixerTitle it does not render. -->
<Mixer aria-label="Mixer" aria-labelledby={undefined} class="w-full" orientation="vertical">
	<MixerChannels>
		{#each CHANNELS as { channels, icon: Icon, id, name, title } (id)}
			{@const state = mixer.channel(id)}
			{#if state}
				<ChannelStrip dimmed={mixer.isDimmed(id)} muted={state.muted} solo={state.solo}>
					<ChannelStripHeader>
						<ChannelStripIcon>
							<Icon />
						</ChannelStripIcon>
						<ChannelStripTitle>{title}</ChannelStripTitle>
					</ChannelStripHeader>
					<ChannelStripMeter>
						<LevelMeter
							aria-label="{name} level"
							ballistics={mixer.isAudible(id) ? undefined : "instant"}
							channelCount={channels}
							size="sm"
							source={demo.sources[id]}
						/>
					</ChannelStripMeter>
					<ChannelStripFader>
						<Fader
							aria-label="{name} volume"
							bind:value={() => state.gainDb, (gainDb) => mixer.setGain(id, gainDb)}
							size="sm"
						/>
					</ChannelStripFader>
					<ChannelStripValue>{formatDb(state.gainDb)}</ChannelStripValue>
					<ChannelStripControls>
						<MuteToggle
							aria-label="Mute {name}"
							bind:pressed={() => state.muted, (muted) => mixer.setMuted(id, muted)}
							size="sm"
						>
							M
						</MuteToggle>
						<SoloToggle
							aria-label="Solo {name}"
							bind:pressed={() => state.solo, (solo) => mixer.setSolo(id, solo)}
							size="sm"
						>
							S
						</SoloToggle>
					</ChannelStripControls>
				</ChannelStrip>
			{/if}
		{/each}
	</MixerChannels>
	<MixerSeparator />
	<MixerMaster>
		<ChannelStrip variant="master">
			<ChannelStripHeader>
				<ChannelStripIcon>
					<SpeakerHighIcon />
				</ChannelStripIcon>
				<ChannelStripTitle>Master</ChannelStripTitle>
			</ChannelStripHeader>
			<ChannelStripMeter>
				<LevelMeter
					aria-label="Master level"
					ballistics={audible ? undefined : "instant"}
					channelCount={2}
					size="sm"
					source={demo.master}
				/>
			</ChannelStripMeter>
			<ChannelStripFader>
				<Fader
					aria-label="Master volume"
					bind:value={() => mixer.master.gainDb, (gainDb) => mixer.setMasterGain(gainDb)}
					size="sm"
				/>
			</ChannelStripFader>
			<ChannelStripValue>{formatDb(mixer.master.gainDb)}</ChannelStripValue>
		</ChannelStrip>
	</MixerMaster>
</Mixer>
