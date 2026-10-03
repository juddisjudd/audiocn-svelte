<script lang="ts">
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import {
		ChannelStrip,
		ChannelStripControls,
		ChannelStripDescription,
		ChannelStripFader,
		ChannelStripHeader,
		ChannelStripIcon,
		ChannelStripMeter,
		ChannelStripStatus,
		ChannelStripText,
		ChannelStripTitle,
		ChannelStripValue,
	} from "#lib/components/ui/channel-strip/index.js";
	import { MuteToggle, SoloToggle } from "#lib/components/ui/channel-toggle/index.js";
	import { DbReadout } from "#lib/components/ui/db-readout/index.js";
	import { Fader } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
	let gainDb = $state(0);
	let muted = $state(false);
	let solo = $state(false);
</script>

<ChannelStrip class="max-w-2xl" {muted} {solo}>
	<ChannelStripHeader>
		<ChannelStripIcon>
			<MicrophoneIcon />
		</ChannelStripIcon>
		<ChannelStripText>
			<ChannelStripTitle>Microphone</ChannelStripTitle>
			<ChannelStripDescription>Shure MV7+</ChannelStripDescription>
		</ChannelStripText>
		<ChannelStripStatus tone={muted ? "muted" : "live"}>
			{muted ? "Muted" : "Live"}
		</ChannelStripStatus>
	</ChannelStripHeader>
	<ChannelStripMeter>
		<LevelMeter aria-label="Microphone level" size="sm" source={signal.meter} />
	</ChannelStripMeter>
	<ChannelStripFader>
		<Fader aria-label="Microphone volume" bind:value={gainDb} size="sm" />
	</ChannelStripFader>
	<ChannelStripValue>
		<DbReadout source={signal.meter} />
	</ChannelStripValue>
	<ChannelStripControls>
		<MuteToggle bind:pressed={muted} size="sm">M</MuteToggle>
		<SoloToggle bind:pressed={solo} size="sm">S</SoloToggle>
	</ChannelStripControls>
</ChannelStrip>
