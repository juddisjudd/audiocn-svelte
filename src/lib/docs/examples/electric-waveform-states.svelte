<script lang="ts">
	import { ElectricWaveform } from "#lib/components/ui/electric-waveform/index.js";
</script>

<div class="grid w-full max-w-lg gap-6 sm:grid-cols-2">
	<div class="grid gap-2">
		<ElectricWaveform aria-label="Idle" class="h-20 text-primary" />
		<span class="text-center text-xs text-muted-foreground">idle</span>
	</div>
	<div class="grid gap-2">
		<ElectricWaveform aria-label="Connecting" class="h-20 text-primary" loading />
		<span class="text-center text-xs text-muted-foreground">loading</span>
	</div>
</div>
