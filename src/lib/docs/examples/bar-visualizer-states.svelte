<script lang="ts">
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
</script>

<div class="grid w-full max-w-md gap-6 sm:grid-cols-3">
	<div class="grid gap-2">
		<BarVisualizer aria-label="Idle pulse" barCount={9} class="h-16" idle="pulse" />
		<span class="text-center text-xs text-muted-foreground">idle pulse</span>
	</div>
	<div class="grid gap-2">
		<BarVisualizer aria-label="Idle wave" barCount={9} class="h-16" idle="wave" />
		<span class="text-center text-xs text-muted-foreground">idle wave</span>
	</div>
	<div class="grid gap-2">
		<BarVisualizer aria-label="Connecting" barCount={9} class="h-16" loading />
		<span class="text-center text-xs text-muted-foreground">loading</span>
	</div>
</div>
