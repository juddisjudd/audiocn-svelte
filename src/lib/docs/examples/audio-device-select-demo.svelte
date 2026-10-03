<script lang="ts">
	import {
		AudioDeviceSelect,
		AudioDeviceSelectContent,
		AudioDeviceSelectPreview,
		AudioDeviceSelectTrigger,
		AudioDeviceSelectValue,
	} from "#lib/components/ui/audio-device-select/index.js";
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const audioDevices = useAudioDevices();
	let deviceId = $state<string | null>(null);
	const microphone = useMicrophone(() => ({ deviceId, enabled: deviceId !== null }));
	const analyser = useAudioAnalyser(() => microphone.stream, { historySize: 120 });
</script>

<div class="flex w-full max-w-sm flex-col gap-2">
	<AudioDeviceSelect
		devices={audioDevices.devices}
		loading={audioDevices.isLoading}
		onRequestPermission={audioDevices.requestPermission}
		permission={audioDevices.permission === "unsupported" ? "denied" : audioDevices.permission}
		bind:value={deviceId}
	>
		<AudioDeviceSelectTrigger>
			<AudioDeviceSelectValue placeholder="Select a microphone" />
		</AudioDeviceSelectTrigger>
		<AudioDeviceSelectContent />
	</AudioDeviceSelect>
	<AudioDeviceSelectPreview>
		<LiveWaveform
			active={microphone.status === "active"}
			aria-label="Microphone preview"
			barWidth={2}
			class="h-8"
			mode="scrolling"
			source={analyser.visual}
		/>
	</AudioDeviceSelectPreview>
</div>
