<script lang="ts">
	import {
		Waveform,
		WaveformCanvas,
		WaveformCursor,
		WaveformMarker,
		WaveformRegion,
	} from "#lib/components/ui/waveform/index.js";
	import { formatTime } from "#lib/audio/time.js";

	const peaks = Float32Array.from({ length: 320 }, (_, index) =>
		Math.min(1, 0.2 + Math.abs(Math.sin(index * 0.21)) * 0.6 + (index % 40 < 4 ? 0.3 : 0))
	);

	let start = $state(9);
	let end = $state(22);
</script>

<div class="flex w-full max-w-lg flex-col gap-2">
	<Waveform aria-label="Episode" class="h-20" duration={60} {peaks} variant="mirror">
		<WaveformCanvas />
		<WaveformRegion bind:start bind:end />
		<WaveformMarker time={40}>Intro ends</WaveformMarker>
		<WaveformCursor />
	</Waveform>
	<p class="font-mono text-xs text-muted-foreground">
		Clip {formatTime(start)} – {formatTime(end)}
	</p>
</div>
