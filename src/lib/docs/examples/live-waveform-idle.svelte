<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	let active = $state(false);
	const signal = useDemoSignal({ historySize: 120, kind: "speech" });
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<div class="rounded-lg border bg-muted/20">
		<LiveWaveform
			{active}
			aria-label="Recording preview"
			class="h-16"
			mode="scrolling"
			source={signal.visual}
		/>
	</div>
	<Button class="self-start" onclick={() => (active = !active)} size="sm" variant="outline">
		{active ? "Pause" : "Listen"}
	</Button>
</div>
