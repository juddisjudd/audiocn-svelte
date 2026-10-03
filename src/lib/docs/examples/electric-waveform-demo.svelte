<script lang="ts">
	import { ElectricWaveform } from "#lib/components/ui/electric-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
</script>

<ElectricWaveform
	aria-label="Voice activity"
	class="h-32 max-w-lg text-primary"
	source={signal.visual}
/>
