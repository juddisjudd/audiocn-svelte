<script lang="ts">
	import { ChannelStrip, type ChannelStripProps, ChannelStripTitle } from "./index.js";
	import SoloProbe from "./solo-probe.test.svelte";

	let {
		title,
		probe = false,
		withMeter = false,
		...stripProps
	}: ChannelStripProps & { title?: string; probe?: boolean; withMeter?: boolean } = $props();
</script>

<ChannelStrip {...stripProps}>
	{#if title}
		<ChannelStripTitle>{title}</ChannelStripTitle>
	{/if}
	{#if probe}
		<SoloProbe />
	{/if}
	{#if withMeter}
		<div data-clipping="" data-slot="level-meter"></div>
	{/if}
</ChannelStrip>
