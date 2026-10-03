<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { formatTime } from "#lib/audio/time.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerTimeType = "current" | "remaining" | "duration";

	export type AudioPlayerTimeProps = WithElementRef<
		Omit<HTMLAttributes<HTMLSpanElement>, "children">,
		HTMLSpanElement
	> & {
		/** Default `current`. */
		type?: AudioPlayerTimeType;
		format?: (seconds: number, type: AudioPlayerTimeType) => string;
	};

	const defaultTimeFormat = (seconds: number, type: AudioPlayerTimeType) =>
		formatTime(seconds, { remaining: type === "remaining" });
</script>

<script lang="ts">
	import { getAudioPlayerContext } from "./audio-player-context.svelte.js";

	let {
		ref = $bindable(null),
		type = "current",
		format = defaultTimeFormat,
		class: className,
		...restProps
	}: AudioPlayerTimeProps = $props();

	const context = getAudioPlayerContext("AudioPlayerTime");

	// As wide as the longest time this track can show, so it never shifts.
	const timeWidth = $derived(
		Math.max(format(0, type).length, format(context.player.duration, type).length)
	);

	const seconds = $derived.by(() => {
		const { currentTime, duration } = context.player;
		if (type === "duration") {
			return duration;
		}
		if (type === "remaining") {
			return Math.max(0, duration - currentTime);
		}
		return currentTime;
	});
</script>

<span
	bind:this={ref}
	class={cn(
		"inline-block min-w-(--audio-player-time-width) text-end font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums",
		className
	)}
	data-slot="audio-player-time"
	data-type={type}
	style:--audio-player-time-width="{timeWidth}ch"
	{...restProps}
>
	{format(seconds, type)}
</span>
