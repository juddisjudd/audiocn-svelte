<script lang="ts">
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ historySize: 120, kind: "speech" });
</script>

<LiveWaveform
	aria-label="Microphone waveform"
	class="h-20 max-w-md"
	mode="scrolling"
	source={signal.visual}
/>
