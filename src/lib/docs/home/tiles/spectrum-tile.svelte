<script lang="ts">
	import { Spectrum } from "#lib/components/ui/spectrum/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ bands: 64, kind: "music", seed: 5 });
</script>

<Spectrum
	aria-label="Music spectrum"
	class="h-32 w-full"
	peakHold
	source={signal.visual}
	variant="area"
/>
