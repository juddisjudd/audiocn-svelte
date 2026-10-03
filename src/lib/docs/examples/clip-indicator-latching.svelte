<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		ClipIndicator,
		type ClipIndicatorActions,
	} from "#lib/components/ui/clip-indicator/index.js";

	let clip = $state<ClipIndicatorActions>();
</script>

<div class="flex items-center gap-4">
	<ClipIndicator bind:this={clip} holdMs={Number.POSITIVE_INFINITY} showCount />
	<Button onclick={() => clip?.report(0)} size="sm" variant="outline">Simulate a clip</Button>
	<Button onclick={() => clip?.reset()} size="sm" variant="ghost">Reset</Button>
</div>
