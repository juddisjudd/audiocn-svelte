<script lang="ts">
	import { formatPan, PanControl } from "#lib/components/ui/pan-control/index.js";

	let pan = $state(-0.3);
</script>

<div class="grid w-full max-w-xs gap-2">
	<div class="flex justify-between text-sm">
		<span class="font-medium">Pan</span>
		<span class="font-mono text-xs text-muted-foreground">{formatPan(pan)}</span>
	</div>
	<PanControl bind:value={pan} />
	<div class="flex justify-between text-xs text-muted-foreground">
		<span>L</span>
		<span>R</span>
	</div>
</div>
