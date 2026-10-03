<script lang="ts">
	import DesktopIcon from "phosphor-svelte/lib/DesktopIcon";
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import MusicNotesIcon from "phosphor-svelte/lib/MusicNotesIcon";
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import {
		ChannelStrip,
		ChannelStripControls,
		ChannelStripFader,
		ChannelStripHeader,
		ChannelStripIcon,
		ChannelStripMeter,
		ChannelStripText,
		ChannelStripTitle,
		ChannelStripValue,
	} from "#lib/components/ui/channel-strip/index.js";
	import { MuteToggle, SoloToggle } from "#lib/components/ui/channel-toggle/index.js";
	import { Fader } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import {
		Mixer,
		MixerChannels,
		MixerHeader,
		MixerMaster,
		MixerSeparator,
		MixerTitle,
	} from "#lib/components/ui/mixer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";
	import { useMixer } from "#lib/hooks/use-mixer.svelte.js";
	import { formatDb } from "#lib/audio/decibels.js";

	const speech = useDemoSignal({ kind: "speech" });
	const noise = useDemoSignal({ channels: 2, kind: "noise" });
	const music = useDemoSignal({ channels: 2, kind: "music" });

	const channels = [
		{ icon: MicrophoneIcon, id: "mic", source: speech.meter, title: "Microphone" },
		{ icon: DesktopIcon, id: "system", source: noise.meter, title: "System audio" },
		{ icon: MusicNotesIcon, id: "music", source: music.meter, title: "Music" },
	];

	const mixer = useMixer({ channels: channels.map(({ id }) => ({ id })) });
</script>

<Mixer class="w-full max-w-2xl">
	<MixerHeader>
		<MixerTitle>Audio mixer</MixerTitle>
	</MixerHeader>
	<MixerChannels>
		{#each channels as { icon: Icon, id, source, title } (id)}
			{@const channel = mixer.channel(id)}
			{#if channel}
				<ChannelStrip dimmed={mixer.isDimmed(id)} muted={channel.muted} solo={channel.solo}>
					<ChannelStripHeader>
						<ChannelStripIcon>
							<Icon />
						</ChannelStripIcon>
						<ChannelStripText>
							<ChannelStripTitle>{title}</ChannelStripTitle>
						</ChannelStripText>
					</ChannelStripHeader>
					<ChannelStripMeter>
						<LevelMeter aria-label="{title} level" size="sm" {source} />
					</ChannelStripMeter>
					<ChannelStripFader>
						<Fader
							aria-label="{title} volume"
							bind:value={() => channel.gainDb, (gainDb) => mixer.setGain(id, gainDb)}
							size="sm"
						/>
					</ChannelStripFader>
					<ChannelStripValue>{formatDb(channel.gainDb)}</ChannelStripValue>
					<ChannelStripControls>
						<MuteToggle
							bind:pressed={() => channel.muted, (muted) => mixer.setMuted(id, muted)}
							size="sm"
						>
							M
						</MuteToggle>
						<SoloToggle
							bind:pressed={() => channel.solo, (solo) => mixer.setSolo(id, solo)}
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
				<LevelMeter aria-label="Master level" channelCount={2} size="sm" source={music.meter} />
			</ChannelStripMeter>
			<ChannelStripFader>
				<Fader
					aria-label="Master volume"
					bind:value={() => mixer.master.gainDb, (gainDb) => mixer.setMasterGain(gainDb)}
					size="sm"
				/>
			</ChannelStripFader>
		</ChannelStrip>
	</MixerMaster>
</Mixer>
