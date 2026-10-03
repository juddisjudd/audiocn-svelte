<script lang="ts">
	import { SystemAudioMixer } from "#lib/components/blocks/system-audio-mixer/index.js";
	import { useDemoSounds, useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";

	const tracks = useDemoTracks();
	const sounds = useDemoSounds();
</script>

<SystemAudioMixer class="w-full" sounds={sounds.current} tracks={tracks.current} />
