<script lang="ts">
	import { useChannelStrip } from "./index.js";

	const strip = useChannelStrip();
</script>

<span>{strip.solo ? "soloed" : "not soloed"}</span>
