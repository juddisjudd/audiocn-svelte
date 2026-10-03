<script lang="ts">
	import { SmoothWaveform } from "#lib/components/ui/smooth-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
</script>

<SmoothWaveform
	aria-label="Voice activity"
	class="h-32 max-w-lg text-primary"
	source={signal.visual}
/>
