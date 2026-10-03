<script lang="ts" module>
	import type { VolumeControlProps } from "#lib/components/ui/volume-control/index.js";

	export type AudioPlayerVolumeProps = Omit<
		VolumeControlProps,
		"value" | "onValueChange" | "muted" | "onMutedChange"
	>;
</script>

<script lang="ts">
	import { VolumeControl } from "#lib/components/ui/volume-control/index.js";
	import { cn } from "#lib/utils.js";

	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let { ref = $bindable(null), class: className, ...restProps }: AudioPlayerVolumeProps = $props();

	const context = getAudioPlayerContext("AudioPlayerVolume");
</script>

<VolumeControl
	bind:ref
	bind:value={() => context.player.volume, (value) => context.player.setVolume(value)}
	bind:muted={() => context.player.muted, (muted) => context.player.setMuted(muted)}
	class={cn("w-32", className)}
	data-slot="audio-player-volume"
	{...restProps}
/>
