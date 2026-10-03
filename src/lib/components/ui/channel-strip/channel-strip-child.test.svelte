<script lang="ts">
	import { ChannelStrip, ChannelStripTitle } from "./index.js";

	let ref = $state<HTMLElement | null>(null);

	export const getRef = () => ref;
</script>

<ChannelStrip bind:ref muted>
	{#snippet child({ props, layoutProps })}
		<section {...props}>
			<div {...layoutProps}>
				<ChannelStripTitle>Mic</ChannelStripTitle>
			</div>
		</section>
	{/snippet}
</ChannelStrip>
