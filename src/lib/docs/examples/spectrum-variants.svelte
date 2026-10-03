<script lang="ts">
	import { Spectrum } from "#lib/components/ui/spectrum/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ bands: 64, kind: "speech" });
</script>

<div class="grid w-full max-w-lg gap-6">
	<Spectrum
		class="h-28 [--spectrum:var(--meter-ok)]"
		grid={false}
		source={signal.visual}
		variant="line"
	/>
	<Spectrum class="h-28" source={signal.visual} variant="area" />
</div>
