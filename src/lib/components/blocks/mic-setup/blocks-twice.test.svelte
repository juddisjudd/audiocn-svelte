<script lang="ts">
	import { MusicPlayer } from "#lib/components/blocks/music-player/index.js";
	import { SystemAudioSettings } from "#lib/components/blocks/system-audio-settings/index.js";
	import { MicSetup } from "./index.js";

	const TRACKS = [{ id: "demo", src: "demo.wav", title: "Demo" }];

	let { all = false }: { all?: boolean } = $props();
</script>

<MicSetup />
<MicSetup />
{#if all}
	<MusicPlayer defaultTracks={TRACKS} duckingSource={null} />
	<MusicPlayer defaultTracks={TRACKS} duckingSource={null} />
	<SystemAudioSettings />
	<SystemAudioSettings />
{/if}
