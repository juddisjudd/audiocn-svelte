<script lang="ts">
	import { TrackList, TrackListItem } from "./index.js";

	let { onSelect }: { onSelect: () => void } = $props();
</script>

<TrackList>
	<TrackListItem active {onSelect}>One</TrackListItem>
	<TrackListItem>Two</TrackListItem>
</TrackList>
