<script lang="ts">
	import DesktopIcon from "phosphor-svelte/lib/DesktopIcon";
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import MusicNotesIcon from "phosphor-svelte/lib/MusicNotesIcon";
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
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";
	import { useMixer } from "#lib/hooks/use-mixer.svelte.js";
	import { formatDb } from "#lib/audio/decibels.js";

	const strips = [
		{ accent: "var(--chart-2)", icon: MicrophoneIcon, id: "mic", kind: "speech", title: "Mic" },
		{ accent: "var(--chart-1)", icon: MusicNotesIcon, id: "music", kind: "music", title: "Music" },
		{
			accent: "var(--chart-4)",
			icon: DesktopIcon,
			id: "game",
			kind: "noise",
			seed: 3,
			title: "Game",
		},
	] as const;

	const mixer = useMixer({ channels: strips.map(({ id }) => ({ id })) });
	const signals = strips.map((strip) =>
		useDemoSignal(() => ({
			channels: 2,
			gainDb: mixer.channel(strip.id)?.gainDb,
			kind: strip.kind,
			playing: mixer.isAudible(strip.id),
			seed: "seed" in strip ? strip.seed : undefined,
		}))
	);
</script>

<div class="flex h-96 max-w-full gap-3 overflow-x-auto">
	{#each strips as strip, index (strip.id)}
		{@const channel = mixer.channel(strip.id)}
		{#if channel}
			<ChannelStrip
				accent={strip.accent}
				dimmed={mixer.isDimmed(strip.id)}
				muted={channel.muted}
				solo={channel.solo}
				orientation="vertical"
				variant="card"
			>
				<ChannelStripHeader>
					<ChannelStripIcon>
						<strip.icon />
					</ChannelStripIcon>
					<ChannelStripTitle>{strip.title}</ChannelStripTitle>
				</ChannelStripHeader>
				<ChannelStripMeter>
					<LevelMeter
						aria-label="{strip.title} level"
						ballistics={mixer.isAudible(strip.id) ? undefined : "instant"}
						channelCount={2}
						class="h-full"
						size="sm"
						source={signals[index].meter}
					/>
				</ChannelStripMeter>
				<ChannelStripFader>
					<Fader
						aria-label="{strip.title} volume"
						bind:value={() => channel.gainDb, (gainDb) => mixer.setGain(strip.id, gainDb)}
						size="sm"
						taper="audio"
					/>
				</ChannelStripFader>
				<ChannelStripValue>{formatDb(channel.gainDb)}</ChannelStripValue>
				<ChannelStripControls>
					<MuteToggle
						aria-label="Mute {strip.title}"
						bind:pressed={() => channel.muted, (muted) => mixer.setMuted(strip.id, muted)}
						size="sm"
					>
						M
					</MuteToggle>
					<SoloToggle
						aria-label="Solo {strip.title}"
						bind:pressed={() => channel.solo, (solo) => mixer.setSolo(strip.id, solo)}
						size="sm"
					>
						S
					</SoloToggle>
				</ChannelStripControls>
			</ChannelStrip>
		{/if}
	{/each}
</div>
