<script lang="ts">
	import PanControlKnob from "#lib/docs/examples/pan-control-knob.svelte";
	import { setAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";

	let { disabled = false }: { disabled?: boolean } = $props();

	setAudioConfig(() => (disabled ? { disabled: true } : {}));
</script>

<PanControlKnob />
