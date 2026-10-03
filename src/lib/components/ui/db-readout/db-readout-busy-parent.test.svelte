<script lang="ts">
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";
	import DbReadout from "./db-readout.svelte";

	let { source }: { source: FrameSource<MeterFrame> } = $props();

	// Updates every 100 ms and passes a new inline `format` each time.
	let ticks = $state(0);

	$effect(() => {
		const timer = setInterval(() => {
			ticks += 1;
		}, 100);
		return () => {
			clearInterval(timer);
		};
	});
</script>

<DbReadout data-ticks={ticks} format={(db) => `${db.toFixed(1)} dB`} {source} />
