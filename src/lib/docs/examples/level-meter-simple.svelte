<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech" });
</script>

<LevelMeter aria-label="Microphone level" class="max-w-sm" source={signal.meter} />
