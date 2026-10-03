<script lang="ts">
	import {
		Mixer,
		MixerChannels,
		MixerEmpty,
		MixerHeader,
		MixerTitle,
	} from "#lib/components/ui/mixer/index.js";
</script>

<Mixer class="w-full max-w-md">
	<MixerHeader>
		<MixerTitle>Audio mixer</MixerTitle>
	</MixerHeader>
	<MixerChannels />
	<MixerEmpty>No audio sources yet. Add a microphone to get started.</MixerEmpty>
</Mixer>
