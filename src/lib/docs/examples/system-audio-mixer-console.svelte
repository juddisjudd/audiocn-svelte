<script lang="ts">
	import { SystemAudioMixer } from "#lib/components/blocks/system-audio-mixer/index.js";
	import { useDemoSounds, useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";

	const tracks = useDemoTracks();
	const sounds = useDemoSounds();
</script>

<SystemAudioMixer
	class="h-[30rem] w-full"
	orientation="vertical"
	sounds={sounds.current}
	tracks={tracks.current}
/>
