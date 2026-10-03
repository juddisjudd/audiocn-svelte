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
	import { formatDb } from "#lib/audio/decibels.js";

	const voice = useDemoSignal({ channels: 2, kind: "speech" });
	const music = useDemoSignal({ channels: 2, kind: "music" });
	const game = useDemoSignal({ channels: 2, kind: "noise", seed: 3 });

	const strips = [
		{ accent: "var(--chart-2)", icon: MicrophoneIcon, source: voice.meter, title: "Mic" },
		{ accent: "var(--chart-1)", icon: MusicNotesIcon, source: music.meter, title: "Music" },
		{ accent: "var(--chart-4)", icon: DesktopIcon, source: game.meter, title: "Game" },
	];

	const settings = $state(strips.map(() => ({ gainDb: 0, muted: false })));
</script>

<div class="flex h-96 max-w-full gap-3 overflow-x-auto">
	{#each strips as strip, index (strip.title)}
		<ChannelStrip
			accent={strip.accent}
			muted={settings[index].muted}
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
					channelCount={2}
					class="h-full"
					size="sm"
					source={strip.source}
				/>
			</ChannelStripMeter>
			<ChannelStripFader>
				<Fader
					aria-label="{strip.title} volume"
					bind:value={settings[index].gainDb}
					size="sm"
					taper="audio"
				/>
			</ChannelStripFader>
			<ChannelStripValue>{formatDb(settings[index].gainDb)}</ChannelStripValue>
			<ChannelStripControls>
				<MuteToggle bind:pressed={settings[index].muted} size="sm">M</MuteToggle>
				<SoloToggle size="sm">S</SoloToggle>
			</ChannelStripControls>
		</ChannelStrip>
	{/each}
</div>
