<script lang="ts">
	import { ElectricBarVisualizer } from "#lib/components/ui/electric-bar-visualizer/index.js";
</script>

<div class="grid w-full max-w-md gap-6 sm:grid-cols-3">
	<div class="grid gap-2">
		<ElectricBarVisualizer
			aria-label="Idle pulse"
			barCount={9}
			class="h-16 text-primary"
			idle="pulse"
		/>
		<span class="text-center text-xs text-muted-foreground">idle pulse</span>
	</div>
	<div class="grid gap-2">
		<ElectricBarVisualizer
			aria-label="Idle wave"
			barCount={9}
			class="h-16 text-primary"
			idle="wave"
		/>
		<span class="text-center text-xs text-muted-foreground">idle wave</span>
	</div>
	<div class="grid gap-2">
		<ElectricBarVisualizer aria-label="Connecting" barCount={9} class="h-16 text-primary" loading />
		<span class="text-center text-xs text-muted-foreground">loading</span>
	</div>
</div>
