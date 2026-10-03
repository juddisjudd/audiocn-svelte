<script lang="ts" module>
	import type { ChannelStripStatusTone } from "#lib/components/ui/channel-strip/index.js";
	import type { UseMicrophoneResult } from "#lib/hooks/use-microphone.svelte.js";
	import type { Mixer } from "#lib/hooks/use-mixer.svelte.js";
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";

	export interface MixerMicrophoneChannelProps {
		microphone: UseMicrophoneResult;
		deviceId: string | null;
		onDeviceChange: (deviceId: string | null) => void;
		mixer: Mixer;
		meter: FrameSource<MeterFrame>;
	}

	const microphoneStatus = (
		microphone: UseMicrophoneResult,
		audible: boolean
	): { label: string; tone: ChannelStripStatusTone } => {
		if (microphone.status === "active") {
			return audible ? { label: "Live", tone: "live" } : { label: "Muted", tone: "muted" };
		}
		if (microphone.status === "denied") {
			return { label: "Blocked", tone: "error" };
		}
		return { label: "Off", tone: "default" };
	};
</script>

<script lang="ts">
	import { GearSixIcon, MicrophoneIcon } from "phosphor-svelte";

	import { AudioDeviceSelect } from "#lib/components/ui/audio-device-select/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { ChannelStripNotice } from "#lib/components/ui/channel-strip/index.js";
	import { Popover, PopoverContent, PopoverTrigger } from "#lib/components/ui/popover/index.js";
	import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";
	import MixerSourceStrip from "./mixer-source-strip.svelte";

	let { microphone, deviceId, onDeviceChange, mixer, meter }: MixerMicrophoneChannelProps =
		$props();

	const devices = useAudioDevices();
	const active = $derived(microphone.status === "active");
	const deviceLabel = $derived(
		devices.devices.find((device) => device.id === deviceId)?.label ?? "Default microphone"
	);
</script>

{#snippet icon()}
	<MicrophoneIcon />
{/snippet}

{#snippet actions()}
	<Popover>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button {...props} aria-label="Microphone settings" size="icon-xs" variant="ghost">
					<GearSixIcon />
				</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent class="w-72">
			<AudioDeviceSelect
				bind:value={() => deviceId, onDeviceChange}
				devices={devices.devices}
				loading={devices.isLoading}
				onRequestPermission={() => devices.requestPermission()}
				permission={devices.permission === "unsupported" ? "denied" : devices.permission}
			/>
		</PopoverContent>
	</Popover>
	<Button
		onclick={() => (active ? microphone.stop() : microphone.start())}
		size="xs"
		variant={active ? "secondary" : "outline"}
	>
		{active ? "Stop" : "Start"}
	</Button>
{/snippet}

{#snippet deniedNotice()}
	<ChannelStripNotice variant="destructive">
		Microphone access is blocked. Allow it in your browser's site settings.
	</ChannelStripNotice>
{/snippet}

<MixerSourceStrip
	accent="var(--chart-2)"
	{actions}
	description={active ? deviceLabel : "Not listening"}
	{icon}
	id="microphone"
	{meter}
	{mixer}
	notice={microphone.status === "denied" ? deniedNotice : undefined}
	status={microphoneStatus(microphone, mixer.isAudible("microphone"))}
	title="Microphone"
/>
