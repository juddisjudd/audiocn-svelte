<script lang="ts">
	import DesktopIcon from "phosphor-svelte/lib/DesktopIcon";
	import MicrophoneSlashIcon from "phosphor-svelte/lib/MicrophoneSlashIcon";
	import WarningIcon from "phosphor-svelte/lib/WarningIcon";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		ChannelStrip,
		ChannelStripHeader,
		ChannelStripIcon,
		ChannelStripMeter,
		ChannelStripNotice,
		ChannelStripStatus,
		ChannelStripText,
		ChannelStripTitle,
	} from "#lib/components/ui/channel-strip/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
</script>

<div class="grid w-full max-w-2xl gap-3">
	<ChannelStrip disabled>
		<ChannelStripHeader>
			<ChannelStripIcon>
				<MicrophoneSlashIcon />
			</ChannelStripIcon>
			<ChannelStripText>
				<ChannelStripTitle>Microphone</ChannelStripTitle>
			</ChannelStripText>
			<ChannelStripStatus tone="error">Blocked</ChannelStripStatus>
		</ChannelStripHeader>
		<ChannelStripMeter>
			<LevelMeter aria-label="Microphone level" size="sm" />
		</ChannelStripMeter>
		<ChannelStripNotice variant="destructive">
			Microphone access is blocked. Allow it in your browser's site settings.
		</ChannelStripNotice>
	</ChannelStrip>
	<ChannelStrip>
		<ChannelStripHeader>
			<ChannelStripIcon>
				<DesktopIcon />
			</ChannelStripIcon>
			<ChannelStripText>
				<ChannelStripTitle>System audio</ChannelStripTitle>
			</ChannelStripText>
			<ChannelStripStatus tone="warning">Paused</ChannelStripStatus>
		</ChannelStripHeader>
		<ChannelStripMeter>
			<LevelMeter aria-label="System audio level" size="sm" />
		</ChannelStripMeter>
		<ChannelStripNotice variant="warning">
			<WarningIcon />
			<span class="flex-1">Paused to prevent an echo from your own stream.</span>
			<Button size="xs" variant="outline">Resume</Button>
		</ChannelStripNotice>
	</ChannelStrip>
</div>
