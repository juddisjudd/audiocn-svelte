<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { AudioPlayerController } from "#lib/hooks/use-audio-player.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioPlayerProviderProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		player: AudioPlayerController;
		onTimeUpdate?: (time: number) => void;
		onPrevious?: () => void;
		onNext?: () => void;
		shortcuts: boolean;
	};

	type DivKeyboardEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement };
</script>

<script lang="ts">
	import { untrack } from "svelte";

	import { setAudioPlayerContext } from "./audio-player-context.svelte.js";
	import { shortcutFor } from "./audio-player-utils.js";

	let {
		ref = $bindable(null),
		player,
		onTimeUpdate,
		onPrevious,
		onNext,
		shortcuts,
		class: className,
		children,
		onkeydown,
		...restProps
	}: AudioPlayerProviderProps = $props();

	setAudioPlayerContext({
		get onNext() {
			return onNext;
		},
		get onPrevious() {
			return onPrevious;
		},
		get player() {
			return player;
		},
	});

	// Reports time changes, not every update of the parent.
	const currentTime = $derived(player.currentTime);

	$effect(() => {
		const time = currentTime;
		untrack(() => onTimeUpdate?.(time));
	});

	const handleKeyDown = (event: DivKeyboardEvent) => {
		onkeydown?.(event);
		if (!shortcuts || event.defaultPrevented || event.metaKey || event.ctrlKey) {
			return;
		}
		const action = shortcutFor(event, player);
		if (action) {
			event.preventDefault();
			action();
		}
	};
</script>

<div
	bind:this={ref}
	class={cn(
		"group/audio-player flex flex-wrap items-center gap-x-3 gap-y-2 outline-none",
		className
	)}
	data-ended={player.status === "ended" ? "" : undefined}
	data-error={player.status === "error" ? "" : undefined}
	data-loading={player.status === "loading" ? "" : undefined}
	data-muted={player.muted ? "" : undefined}
	data-paused={player.playing ? undefined : ""}
	data-playing={player.playing ? "" : undefined}
	data-slot="audio-player"
	onkeydown={handleKeyDown}
	role="group"
	{...restProps}
>
	{@render children?.()}
</div>
