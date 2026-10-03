<script lang="ts">
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ historySize: 120, kind: "music" });
</script>

<div class="grid w-full max-w-md gap-6">
	<div class="grid gap-1.5">
		<span class="text-xs text-muted-foreground">static bars</span>
		<LiveWaveform aria-label="Spectrum bars" class="h-14" source={signal.visual} />
	</div>
	<div class="grid gap-1.5">
		<span class="text-xs text-muted-foreground">static mirror</span>
		<LiveWaveform
			aria-label="Mirrored spectrum"
			class="h-14 text-primary"
			source={signal.visual}
			variant="mirror"
		/>
	</div>
	<div class="grid gap-1.5">
		<span class="text-xs text-muted-foreground">static line</span>
		<LiveWaveform aria-label="Waveform trace" class="h-14" source={signal.visual} variant="line" />
	</div>
	<div class="grid gap-1.5">
		<span class="text-xs text-muted-foreground">scrolling line</span>
		<LiveWaveform
			aria-label="Level history"
			class="h-14 [--waveform:var(--meter-ok)]"
			mode="scrolling"
			source={signal.visual}
			variant="line"
		/>
	</div>
</div>
