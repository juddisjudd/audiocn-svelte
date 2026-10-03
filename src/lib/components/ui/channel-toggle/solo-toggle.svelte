<script lang="ts">
	import ChannelToggle, { type ChannelToggleProps } from "./channel-toggle.svelte";

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		...restProps
	}: Omit<ChannelToggleProps, "tone"> = $props();
</script>

<ChannelToggle
	bind:ref
	bind:pressed
	aria-label="Solo"
	data-slot="solo-toggle"
	tone="solo"
	{...restProps}
/>
