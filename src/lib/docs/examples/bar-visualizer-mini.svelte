<script lang="ts">
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "speech", seed: 12 });
</script>

<Badge class="h-7" variant="secondary">
	<MicrophoneIcon />
	Live
	<BarVisualizer
		aria-hidden="true"
		barCount={5}
		class="h-3.5 w-7 [--bar-gap:2px] [--bar-width:3px]"
		minLevel={0.15}
		source={signal.visual}
	/>
</Badge>
