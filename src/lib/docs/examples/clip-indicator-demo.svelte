<script lang="ts">
	import { ClipIndicator } from "#lib/components/ui/clip-indicator/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const signal = useDemoSignal({ kind: "music", seed: 11 });
</script>

<div class="flex items-center gap-6">
	<ClipIndicator source={signal.meter} />
	<ClipIndicator showCount source={signal.meter} />
	<ClipIndicator source={signal.meter}>Clip</ClipIndicator>
</div>
