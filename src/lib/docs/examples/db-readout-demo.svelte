<script lang="ts">
	import { DbReadout } from "#lib/components/ui/db-readout/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
</script>

<div class="grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-2 text-sm">
	<span class="text-muted-foreground">Peak</span>
	<DbReadout source={signal.meter} />
	<span class="text-muted-foreground">RMS</span>
	<DbReadout measure="rms" source={signal.meter} />
	<span class="text-muted-foreground">Peak, held 1 s</span>
	<DbReadout holdMs={1000} source={signal.meter} />
	<span class="text-muted-foreground">Value</span>
	<DbReadout value={-6} />
</div>
