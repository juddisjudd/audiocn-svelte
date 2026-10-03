<script lang="ts">
	import { SystemAudioSettings } from "#lib/components/blocks/system-audio-settings/index.js";
	import { MicSetup } from "./index.js";

	let { withSettings = false }: { withSettings?: boolean } = $props();
</script>

<MicSetup />
<MicSetup />
{#if withSettings}
	<SystemAudioSettings />
	<SystemAudioSettings />
{/if}
