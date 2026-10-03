<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { AudioPlayerButtonProps } from "./audio-player-button.svelte";

	export type AudioPlayerPlayProps = Omit<AudioPlayerButtonProps, "children"> & {
		children?: Snippet<[{ playing: boolean; loading: boolean }]>;
	};
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";

	import AudioPlayerButton from "./audio-player-button.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let {
		ref = $bindable(null),
		disabled,
		class: className,
		children,
		...restProps
	}: AudioPlayerPlayProps = $props();

	const context = getAudioPlayerContext("AudioPlayerPlay");
	const loading = $derived(context.player.status === "loading");
	const playing = $derived(context.player.playing);
</script>

{#snippet content()}
	{@render children?.({ loading, playing })}
{/snippet}

<AudioPlayerButton
	bind:ref
	slotName="audio-player-play"
	label={playing ? "Pause" : "Play"}
	action={() => {
		context.player.toggle();
	}}
	disabled={disabled ?? (context.player.status === "idle" || context.player.status === "error")}
	state={{ loading, playing }}
	class={cn("size-10 bg-primary text-primary-foreground hover:bg-primary/85", className)}
	children={children ? content : undefined}
	{...restProps}
/>
