<script lang="ts">
	import { ChannelStrip, ChannelStripTitle } from "#lib/components/ui/channel-strip/index.js";
	import { Fader } from "#lib/components/ui/fader/index.js";
	import { Mixer, MixerChannels } from "./index.js";
</script>

<Mixer orientation="vertical">
	<MixerChannels>
		<ChannelStrip>
			<ChannelStripTitle>A</ChannelStripTitle>
			<Fader aria-label="A volume" />
		</ChannelStrip>
		<ChannelStrip>
			<ChannelStripTitle>B</ChannelStripTitle>
			<Fader aria-label="B volume" />
		</ChannelStrip>
	</MixerChannels>
</Mixer>
