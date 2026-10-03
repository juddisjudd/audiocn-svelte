<script lang="ts" module>
	import type { AudioPlayerButtonProps } from "./audio-player-button.svelte";

	export type AudioPlayerRateProps = AudioPlayerButtonProps & {
		/** Default `[0.5, 0.75, 1, 1.25, 1.5, 2]`. Cycles on click. */
		rates?: number[];
	};
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";

	import AudioPlayerButton from "./audio-player-button.svelte";
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";
	import { DEFAULT_RATES } from "./audio-player-utils.js";

	let {
		ref = $bindable(null),
		rates = DEFAULT_RATES,
		class: className,
		children,
		...restProps
	}: AudioPlayerRateProps = $props();

	const context = getAudioPlayerContext("AudioPlayerRate");
	const rate = $derived(context.player.playbackRate);
	const next = $derived(rates[(rates.indexOf(rate) + 1) % rates.length] ?? 1);
	const rateWidth = $derived(Math.max(...rates.map((item) => `${item}×`.length)));
</script>

{#snippet content()}
	<span
		class="inline-block min-w-(--rate-width) text-center font-mono text-xs tabular-nums"
		style:--rate-width="{rateWidth}ch"
	>
		{rate}×
	</span>
{/snippet}

<AudioPlayerButton
	bind:ref
	slotName="audio-player-rate"
	label="Playback speed {rate}×"
	action={() => context.player.setPlaybackRate(next)}
	class={cn("w-auto px-2", className)}
	children={children ?? content}
	{...restProps}
/>
