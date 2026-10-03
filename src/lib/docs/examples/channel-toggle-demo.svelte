<script lang="ts">
	import HeadphonesIcon from "phosphor-svelte/lib/HeadphonesIcon";
	import {
		MonitorToggle,
		MuteToggle,
		SoloToggle,
	} from "#lib/components/ui/channel-toggle/index.js";

	let muted = $state(true);
	let solo = $state(false);
	let monitor = $state(false);
</script>

<div class="flex items-center gap-1.5">
	<MuteToggle bind:pressed={muted}>M</MuteToggle>
	<SoloToggle bind:pressed={solo}>S</SoloToggle>
	<MonitorToggle bind:pressed={monitor} size="icon">
		<HeadphonesIcon />
	</MonitorToggle>
</div>
