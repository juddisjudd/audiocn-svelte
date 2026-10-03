<script lang="ts">
	import type { MeterZone } from "#lib/audio/types.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const zones: MeterZone[] = [
		{ fromDb: Number.NEGATIVE_INFINITY, zone: "ok" },
		{ fromDb: -12, zone: "warn" },
		{ fromDb: -3, zone: "clip" },
	];

	const signal = useDemoSignal({ kind: "music", seed: 9 });
</script>

<div class="grid w-full max-w-md gap-5">
	<LevelMeter
		aria-label="Monochrome meter"
		class="[--meter-clip:var(--foreground)] [--meter-ok:var(--muted-foreground)] [--meter-warn:var(--foreground)]"
		size="lg"
		source={signal.meter}
		variant="segmented"
	/>
	<LevelMeter aria-label="Meter with custom zones" size="lg" source={signal.meter} {zones} />
</div>
