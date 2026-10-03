<script lang="ts">
	import { Waveform, WaveformHover } from "./index.js";

	const PEAKS = [0.2, 0.6, 1, 0.6, 0.2];

	let { loading }: { loading: boolean } = $props();
</script>

<Waveform duration={100} {loading} peaks={PEAKS}>
	<WaveformHover />
</Waveform>
