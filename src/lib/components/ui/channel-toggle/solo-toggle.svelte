<script lang="ts">
	import ChannelToggle, { type ChannelTogglePresetProps } from "./channel-toggle.svelte";

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		...restProps
	}: ChannelTogglePresetProps = $props();
</script>

<ChannelToggle
	bind:ref
	bind:pressed
	aria-label="Solo"
	data-slot="solo-toggle"
	tone="solo"
	{...restProps}
/>
