<script lang="ts">
	import {
		ChannelStrip,
		ChannelStripControls,
		ChannelStripFader,
		ChannelStripHeader,
		ChannelStripMeter,
		ChannelStripTitle,
		ChannelStripValue,
	} from "#lib/components/ui/channel-strip/index.js";
	import { MuteToggle, SoloToggle } from "#lib/components/ui/channel-toggle/index.js";
	import { Fader } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { Mixer, MixerChannels, MixerHeader, MixerTitle } from "#lib/components/ui/mixer/index.js";
	import { type DemoSignalKind, useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";
	import { useMixer } from "#lib/hooks/use-mixer.svelte.js";
	import { formatDb } from "#lib/audio/decibels.js";

	const CHANNEL_COUNT = 16;
	const KINDS: DemoSignalKind[] = ["speech", "music", "noise", "music"];

	const channels = Array.from({ length: CHANNEL_COUNT }, (_, index) => ({
		id: `input-${index + 1}`,
		kind: KINDS[index % KINDS.length] ?? "music",
		seed: index + 1,
		title: `In ${index + 1}`,
	}));

	const mixer = useMixer({ channels: channels.map(({ id }) => ({ id })) });
	const signals = channels.map(({ id, kind, seed }) =>
		useDemoSignal(() => ({
			gainDb: mixer.channel(id)?.gainDb,
			kind,
			playing: mixer.isAudible(id),
			seed,
		}))
	);
</script>

<Mixer class="w-full" orientation="vertical">
	<MixerHeader>
		<MixerTitle>Console</MixerTitle>
	</MixerHeader>
	<MixerChannels>
		{#each channels as { id, title }, index (id)}
			{@const channel = mixer.channel(id)}
			{#if channel}
				<ChannelStrip dimmed={mixer.isDimmed(id)} muted={channel.muted} solo={channel.solo}>
					<ChannelStripHeader>
						<ChannelStripTitle>{title}</ChannelStripTitle>
					</ChannelStripHeader>
					<ChannelStripMeter>
						<LevelMeter
							aria-label="{title} level"
							ballistics={mixer.isAudible(id) ? undefined : "instant"}
							size="sm"
							source={signals[index].meter}
						/>
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
</Mixer>
