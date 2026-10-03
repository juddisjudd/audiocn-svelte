<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type {
		AudioPlayerController,
		UseAudioPlayerOptions,
	} from "#lib/hooks/use-audio-player.svelte.js";
	import type { WithElementRef } from "#lib/utils.js";

	export type AudioPlayerProps = WithElementRef<HTMLAttributes<HTMLDivElement>> &
		UseAudioPlayerOptions & {
			/** Use an existing player from `useAudioPlayer` instead of an internal one. */
			player?: AudioPlayerController;
			onTimeUpdate?: (time: number) => void;
			/** Enables the previous button. */
			onPrevious?: () => void;
			/** Enables the next button. */
			onNext?: () => void;
			/** Keyboard shortcuts while focus is inside. Default true. */
			shortcuts?: boolean;
		};
</script>

<script lang="ts">
	import AudioPlayerInternal from "./audio-player-internal.svelte";
	import AudioPlayerProvider from "./audio-player-provider.svelte";

	let {
		ref = $bindable(null),
		player,
		src,
		autoPlay,
		loop,
		volume,
		muted,
		playbackRate,
		preload,
		crossOrigin,
		onPlay,
		onPause,
		onEnded,
		onError,
		shortcuts = true,
		...restProps
	}: AudioPlayerProps = $props();
</script>

{#if player}
	<AudioPlayerProvider bind:ref {player} {shortcuts} {...restProps} />
{:else}
	<AudioPlayerInternal
		options={() => ({
			autoPlay,
			crossOrigin,
			loop,
			muted,
			onEnded,
			onError,
			onPause,
			onPlay,
			playbackRate,
			preload,
			src,
			volume,
		})}
	>
		{#snippet children(internal)}
			<AudioPlayerProvider bind:ref player={internal} {shortcuts} {...restProps} />
		{/snippet}
	</AudioPlayerInternal>
{/if}
