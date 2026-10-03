<script lang="ts">
	import HeadphonesIcon from "phosphor-svelte/lib/HeadphonesIcon";
	import {
		MonitorToggle,
		MuteToggle,
		SoloToggle,
	} from "#lib/components/ui/channel-toggle/index.js";
	import { Fader } from "#lib/components/ui/fader/index.js";
	import { formatPan, PanControl } from "#lib/components/ui/pan-control/index.js";
	import { formatDb } from "#lib/audio/decibels.js";

	let muted = $state(false);
	let solo = $state(true);
	let monitor = $state(false);
	let pan = $state(-0.3);
	let sendDb = $state(-9);
</script>

<div class="flex w-full flex-col gap-4">
	<div class="flex items-center justify-between gap-2">
		<span class="text-sm font-medium">Vocals</span>
		<div class="flex items-center gap-1.5">
			<MuteToggle aria-label="Mute vocals" bind:pressed={muted}>M</MuteToggle>
			<SoloToggle aria-label="Solo vocals" bind:pressed={solo}>S</SoloToggle>
			<MonitorToggle aria-label="Monitor vocals" size="icon" bind:pressed={monitor}>
				<HeadphonesIcon />
			</MonitorToggle>
		</div>
	</div>
	<div class="grid gap-2">
		<div class="flex items-center justify-between text-xs">
			<span class="text-muted-foreground">Pan</span>
			<span class="font-mono">{formatPan(pan)}</span>
		</div>
		<PanControl aria-label="Vocals pan" bind:value={pan} />
	</div>
	<div class="grid gap-2">
		<div class="flex items-center justify-between text-xs">
			<span class="text-muted-foreground">Reverb send</span>
			<span class="font-mono">{formatDb(sendDb)}</span>
		</div>
		<Fader aria-label="Reverb send" size="sm" bind:value={sendDb} />
	</div>
</div>
