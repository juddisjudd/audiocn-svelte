<script lang="ts">
	import { DbReadout } from "#lib/components/ui/db-readout/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "music", seed: 6 });
</script>

<span class="rounded-md bg-muted/40 px-2 py-1 has-data-[zone=clip]:bg-meter-clip/15">
	<DbReadout
		class="text-2xl font-semibold data-silent:text-muted-foreground data-[zone=clip]:text-meter-clip-foreground data-[zone=warn]:text-meter-warn-foreground"
		holdMs={500}
		source={signal.meter}
	/>
</span>
