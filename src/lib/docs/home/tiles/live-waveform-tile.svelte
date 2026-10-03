<script lang="ts">
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const music = useDemoSignal({ kind: "music", seed: 6 });
	const voice = useDemoSignal({ historySize: 120, kind: "speech", seed: 6 });
</script>

<div class="flex w-full flex-col gap-3">
	<LiveWaveform
		aria-label="Music oscilloscope"
		class="h-16 text-primary"
		source={music.visual}
		variant="line"
	/>
	<LiveWaveform
		aria-label="Voice level history"
		class="h-12 [--waveform:var(--meter-ok)]"
		mode="scrolling"
		source={voice.visual}
	/>
</div>
