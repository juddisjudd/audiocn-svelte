<script lang="ts">
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import SpeakerLowIcon from "phosphor-svelte/lib/SpeakerLowIcon";
	import SpeakerNoneIcon from "phosphor-svelte/lib/SpeakerNoneIcon";
	import SpeakerXIcon from "phosphor-svelte/lib/SpeakerXIcon";
	import {
		AudioDeviceSelect,
		AudioDeviceSelectContent,
		AudioDeviceSelectTrigger,
		AudioDeviceSelectValue,
		type AudioDevice,
	} from "#lib/components/ui/audio-device-select/index.js";
	import {
		VolumeControl,
		VolumeControlMute,
		VolumeControlSlider,
		VolumeControlValue,
	} from "#lib/components/ui/volume-control/index.js";

	const devices: AudioDevice[] = [
		{ id: "default", isDefault: true, label: "MacBook Pro Speakers" },
		{ description: "USB", id: "interface", label: "Scarlett 2i2" },
		{ description: "Bluetooth", id: "headphones", label: "AirPods Pro" },
		{
			description: "Disconnected",
			id: "monitors",
			label: "Studio Display",
			status: "unavailable",
		},
	];
</script>

<div class="flex w-full flex-col gap-4">
	<AudioDeviceSelect {devices} value="interface">
		<AudioDeviceSelectTrigger aria-label="Output device">
			<AudioDeviceSelectValue />
		</AudioDeviceSelectTrigger>
		<AudioDeviceSelectContent />
	</AudioDeviceSelect>
	<VolumeControl class="w-full" value={0.7}>
		<VolumeControlMute class="group/mute">
			<SpeakerXIcon class="hidden group-data-[level=muted]/mute:block" />
			<SpeakerNoneIcon class="hidden group-data-[level=low]/mute:block" />
			<SpeakerLowIcon class="hidden group-data-[level=medium]/mute:block" />
			<SpeakerHighIcon class="hidden group-data-[level=high]/mute:block" />
		</VolumeControlMute>
		<VolumeControlSlider />
		<VolumeControlValue />
	</VolumeControl>
</div>
