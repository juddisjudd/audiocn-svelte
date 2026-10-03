<script lang="ts">
	import type { FrameSource, VisualFrame } from "#lib/audio/types.js";

	import { Spectrum, SpectrumCanvas } from "./index.js";

	let { source }: { source: FrameSource<VisualFrame> } = $props();
</script>

<Spectrum {source}>
	<SpectrumCanvas />
	<SpectrumCanvas />
</Spectrum>
