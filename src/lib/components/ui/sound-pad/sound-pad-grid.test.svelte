<script lang="ts">
	import { SoundPad, SoundPadGrid, type SoundPadGridProps, type SoundPadProps } from "./index.js";

	let {
		pads,
		withInput = false,
		...gridProps
	}: SoundPadGridProps & {
		pads: Array<SoundPadProps & { label: string }>;
		withInput?: boolean;
	} = $props();
</script>

{#if withInput}
	<input aria-label="Notes" />
{/if}
<SoundPadGrid {...gridProps}>
	{#each pads as { label, ...pad } (label)}
		<SoundPad {...pad}>{label}</SoundPad>
	{/each}
</SoundPadGrid>
