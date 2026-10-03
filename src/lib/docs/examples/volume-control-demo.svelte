<script lang="ts">
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import SpeakerLowIcon from "phosphor-svelte/lib/SpeakerLowIcon";
	import SpeakerNoneIcon from "phosphor-svelte/lib/SpeakerNoneIcon";
	import SpeakerXIcon from "phosphor-svelte/lib/SpeakerXIcon";
	import {
		VolumeControl,
		VolumeControlMute,
		VolumeControlSlider,
		VolumeControlValue,
	} from "#lib/components/ui/volume-control/index.js";
</script>

<VolumeControl class="w-full max-w-xs" value={0.6}>
	<VolumeControlMute class="group/mute">
		<SpeakerXIcon class="hidden group-data-[level=muted]/mute:block" />
		<SpeakerNoneIcon class="hidden group-data-[level=low]/mute:block" />
		<SpeakerLowIcon class="hidden group-data-[level=medium]/mute:block" />
		<SpeakerHighIcon class="hidden group-data-[level=high]/mute:block" />
	</VolumeControlMute>
	<VolumeControlSlider />
	<VolumeControlValue />
</VolumeControl>
