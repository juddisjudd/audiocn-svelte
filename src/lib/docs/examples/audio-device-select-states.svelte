<script lang="ts">
	import {
		AudioDeviceSelect,
		type AudioDevice,
	} from "#lib/components/ui/audio-device-select/index.js";

	const devices: AudioDevice[] = [
		{ id: "default", isDefault: true, label: "MacBook Pro Microphone" },
		{ description: "USB", id: "usb", label: "Shure MV7+" },
		{
			description: "In use by another app",
			id: "busy",
			label: "Elgato Wave:3",
			status: "unavailable",
		},
	];
</script>

<div class="grid w-full max-w-sm gap-4">
	<AudioDeviceSelect {devices} value="usb" />
	<AudioDeviceSelect allowNone {devices} noneLabel="No microphone" />
	<AudioDeviceSelect {devices} value="rode" />
	<AudioDeviceSelect devices={[]} loading />
</div>
