<script lang="ts">
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	const STATES = [
		{ label: "Idle", value: "idle" },
		{ label: "Connecting", value: "connecting" },
		{ label: "Speaking", value: "speaking" },
	] as const;

	type VoiceState = (typeof STATES)[number]["value"];

	let voiceState = $state<VoiceState>("speaking");
	const voice = useDemoSignal({ kind: "speech", seed: 2 });
</script>

<div class="flex w-full flex-col items-center gap-5">
	<BarVisualizer
		align="center"
		aria-label={`Voice agent, ${voiceState}`}
		barCount={9}
		class="h-28 w-full max-w-52 text-primary"
		idle="wave"
		loading={voiceState === "connecting"}
		mirrored
		source={voiceState === "speaking" ? voice.visual : null}
	/>
	<div class="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
		{#each STATES as option (option.value)}
			<Button
				aria-pressed={voiceState === option.value}
				onclick={() => (voiceState = option.value)}
				size="xs"
				variant={voiceState === option.value ? "outline" : "ghost"}
			>
				{option.label}
			</Button>
		{/each}
	</div>
</div>
