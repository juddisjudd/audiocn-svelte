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
	aria-label="Mute"
	data-slot="mute-toggle"
	tone="mute"
	{...restProps}
/>
