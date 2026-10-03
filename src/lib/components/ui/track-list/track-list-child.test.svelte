<script lang="ts">
	import { TrackList, TrackListItem } from "./index.js";

	let { onSelect }: { onSelect: () => void } = $props();
</script>

<TrackList>
	<TrackListItem active {onSelect}>
		{#snippet child({ props })}
			<li {...props} data-custom="">One</li>
		{/snippet}
	</TrackListItem>
</TrackList>
