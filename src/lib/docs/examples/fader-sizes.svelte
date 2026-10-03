<script lang="ts">
	import { Fader } from "#lib/components/ui/fader/index.js";

	const sizes = ["sm", "default", "lg"] as const;
</script>

<div class="grid w-full max-w-sm gap-6">
	{#each sizes as size (size)}
		<Fader aria-label="{size} fader" value={-12} {size} />
	{/each}
	<Fader aria-label="Disabled fader" value={-24} disabled />
</div>
