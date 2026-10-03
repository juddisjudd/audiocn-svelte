<script lang="ts">
	import { Spectrum } from "#lib/components/ui/spectrum/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ bands: 48, kind: "music" });
</script>

<Spectrum class="max-w-lg" minDb={-60} maxDb={0} peakHold source={signal.visual} />
