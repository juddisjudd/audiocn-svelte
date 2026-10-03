<script lang="ts">
	import { LevelMeter, LevelMeterChannel } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech", seed: 5 });
</script>

<LevelMeter aria-label="Speaking indicator" class="w-auto" source={signal.meter}>
	<LevelMeterChannel class="relative size-20 items-center justify-center">
		<span
			class="absolute size-20 scale-[calc(0.6_+_var(--meter-level)_*_0.6)] rounded-full bg-primary/15"
		></span>
		<span
			class="absolute size-14 scale-[calc(0.8_+_var(--meter-level)_*_0.4)] rounded-full bg-primary/30"
		></span>
		<span class="relative size-10 rounded-full bg-primary"></span>
	</LevelMeterChannel>
</LevelMeter>
