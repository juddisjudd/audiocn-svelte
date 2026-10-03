<script lang="ts">
	import { Soundboard } from "#lib/components/blocks/soundboard/index.js";
	import { useDemoSounds } from "#lib/docs/use-demo-audio.svelte.js";

	const sounds = useDemoSounds();
</script>

{#if sounds.current.length === 0}
	<p class="text-sm text-muted-foreground">Preparing sounds…</p>
{:else}
	<Soundboard class="w-full max-w-2xl" defaultSounds={sounds.current} />
{/if}
