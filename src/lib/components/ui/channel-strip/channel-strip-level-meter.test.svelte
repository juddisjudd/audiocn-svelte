<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { ChannelStrip, ChannelStripTitle } from "./index.js";
</script>

<ChannelStrip muted orientation="vertical">
	<ChannelStripTitle>Mic</ChannelStripTitle>
	<LevelMeter aria-label="Mic level" />
</ChannelStrip>
