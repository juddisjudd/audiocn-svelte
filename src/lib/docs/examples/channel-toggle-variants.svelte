<script lang="ts">
	import MicrophoneSlashIcon from "phosphor-svelte/lib/MicrophoneSlashIcon";
	import { ChannelToggle, MuteToggle } from "#lib/components/ui/channel-toggle/index.js";

	const variants = ["default", "outline", "ghost"] as const;
</script>

<div class="grid gap-4">
	{#each variants as variant (variant)}
		<div class="flex items-center gap-2">
			<MuteToggle pressed {variant}>
				<MicrophoneSlashIcon />
				Muted
			</MuteToggle>
			<MuteToggle {variant}>Mute</MuteToggle>
			<ChannelToggle aria-label="Record arm" pressed {variant}>R</ChannelToggle>
			<span class="font-mono text-xs text-muted-foreground">{variant}</span>
		</div>
	{/each}
</div>
