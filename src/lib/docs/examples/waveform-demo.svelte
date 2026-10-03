<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		Waveform,
		WaveformCanvas,
		WaveformCursor,
		WaveformHover,
	} from "#lib/components/ui/waveform/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";
	import { useWaveformData } from "#lib/hooks/use-waveform-data.svelte.js";

	const tracks = useDemoTracks();
	const track = $derived(tracks.current[0]);
	const player = useAudioPlayer(() => ({ src: track?.src }));
	const waveform = useWaveformData(() => track?.src ?? null);
</script>

<div class="flex w-full max-w-lg flex-col gap-3">
	<Waveform
		aria-label="Night Drive"
		class="h-20"
		duration={waveform.duration}
		loading={waveform.status !== "ready"}
		onSeekCommit={(value) => player.seek(value)}
		peaks={waveform.peaks}
		time={player.time}
	>
		<WaveformCanvas />
		<WaveformCursor />
		<WaveformHover />
	</Waveform>
	<Button
		class="self-start"
		disabled={!track}
		onclick={() => player.toggle()}
		size="sm"
		variant="outline"
	>
		{player.playing ? "Pause" : "Play"}
	</Button>
</div>
