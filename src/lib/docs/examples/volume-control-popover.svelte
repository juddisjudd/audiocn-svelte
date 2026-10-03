<script lang="ts">
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import SpeakerXIcon from "phosphor-svelte/lib/SpeakerXIcon";
	import { Button } from "#lib/components/ui/button/index.js";
	import { Popover, PopoverContent, PopoverTrigger } from "#lib/components/ui/popover/index.js";
	import {
		VolumeControl,
		VolumeControlMute,
		VolumeControlSlider,
	} from "#lib/components/ui/volume-control/index.js";

	let volume = $state(0.8);
	let muted = $state(false);
</script>

<Popover>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button {...props} aria-label="Volume" size="icon" variant="outline">
				{#if muted || volume === 0}
					<SpeakerXIcon />
				{:else}
					<SpeakerHighIcon />
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class="w-auto" side="top">
		<VolumeControl orientation="vertical" bind:muted bind:value={volume}>
			<VolumeControlMute>
				{#if muted}
					<SpeakerXIcon />
				{:else}
					<SpeakerHighIcon />
				{/if}
			</VolumeControlMute>
			<VolumeControlSlider />
		</VolumeControl>
	</PopoverContent>
</Popover>
