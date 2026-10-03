<script lang="ts">
	import { LevelMeter, LevelMeterValue } from "./index.js";

	let { peakDb }: { peakDb: number } = $props();
</script>

<LevelMeter aria-label="Mic" {peakDb}>
	<LevelMeterValue />
</LevelMeter>
