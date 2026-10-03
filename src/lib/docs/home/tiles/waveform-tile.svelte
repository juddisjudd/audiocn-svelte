<script lang="ts">
	import PauseIcon from "phosphor-svelte/lib/PauseIcon";
	import PlayIcon from "phosphor-svelte/lib/PlayIcon";
	import { formatTime } from "#lib/audio/time.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		Waveform,
		WaveformCanvas,
		WaveformCursor,
		WaveformHover,
		WaveformMarker,
		WaveformRegion,
	} from "#lib/components/ui/waveform/index.js";
	import { useDemoTracks } from "#lib/docs/use-demo-audio.svelte.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";
	import { useWaveformData } from "#lib/hooks/use-waveform-data.svelte.js";

	const TRACK_INDEX = 1;
	const MARKER_TIME = 17;

	const tracks = useDemoTracks();
	const track = $derived(tracks.current.at(TRACK_INDEX));
	const player = useAudioPlayer(() => ({ src: track?.src }));
	const waveform = useWaveformData(() => track?.src ?? null, { samples: 400 });
	let clipStart = $state(5);
	let clipEnd = $state(13);
</script>

<div class="flex w-full flex-col gap-3">
	<div class="flex items-center gap-3">
		<Button
			aria-label={player.playing ? "Pause" : "Play"}
			disabled={!track}
			onclick={() => player.toggle()}
			size="icon"
			variant="outline"
		>
			{#if player.playing}
				<PauseIcon weight="fill" />
			{:else}
				<PlayIcon weight="fill" />
			{/if}
		</Button>
		<div class="flex min-w-0 flex-col">
			<span class="truncate text-sm font-medium">{track?.title ?? "Loading…"}</span>
			<span class="font-mono text-xs text-muted-foreground">
				Clip {formatTime(clipStart)} – {formatTime(clipEnd)}
			</span>
		</div>
	</div>
	<Waveform
		aria-label={track?.title ?? "Track"}
		class="h-24"
		duration={waveform.duration}
		loading={waveform.status !== "ready"}
		onSeekCommit={(time) => player.seek(time)}
		peaks={waveform.peaks}
		time={player.time}
		variant="mirror"
	>
		<WaveformCanvas />
		<WaveformRegion bind:start={clipStart} bind:end={clipEnd} />
		<WaveformMarker time={MARKER_TIME}>Outro</WaveformMarker>
		<WaveformCursor />
		<WaveformHover />
	</Waveform>
</div>
