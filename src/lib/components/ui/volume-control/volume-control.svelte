<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Orientation } from "#lib/audio/types.js";
	import type { AudioSize } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { VolumeCurve } from "./volume-control-utils.js";

	export type VolumeControlProps = WithElementRef<
		Omit<HTMLAttributes<HTMLDivElement>, "onchange">,
		HTMLDivElement
	> & {
		/** Volume, 0..1, like `HTMLMediaElement.volume`. Default 1. */
		value?: number;
		onValueChange?: (value: number) => void;
		onValueCommit?: (value: number) => void;
		/** Default false. */
		muted?: boolean;
		onMutedChange?: (muted: boolean) => void;
		/** Slider step, in position. Default 0.05. */
		step?: number;
		/** How slider position maps to volume. Default `perceptual`. */
		curve?: VolumeCurve;
		orientation?: Orientation;
		size?: AudioSize;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { clamp } from "#lib/audio/decibels.js";
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import VolumeControlMute from "./volume-control-mute.svelte";
	import VolumeControlSlider from "./volume-control-slider.svelte";
	import { curves, levelFor, setVolumeControl } from "./volume-control-utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(1),
		onValueChange,
		onValueCommit,
		muted = $bindable(false),
		onMutedChange,
		step = 0.05,
		curve = "perceptual",
		orientation = "horizontal",
		size: sizeProp,
		disabled: disabledProp,
		class: className,
		children,
		...restProps
	}: VolumeControlProps = $props();

	const config = useAudioConfig();
	const size = $derived(sizeProp ?? config.size ?? "default");
	const disabled = $derived(disabledProp ?? config.disabled ?? false);
	const mapping = $derived(curves[curve]);
	const level = $derived(levelFor(value, muted));

	let lastAudible = untrack(() => (value > 0 ? value : 1));

	const setVolume = (next: number) => {
		if (next > 0) {
			lastAudible = next;
		}
		value = next;
		onValueChange?.(next);
	};

	const setMuted = (next: boolean) => {
		muted = next;
		onMutedChange?.(next);
	};

	setVolumeControl({
		get volume() {
			return value;
		},
		get muted() {
			return muted;
		},
		get level() {
			return level;
		},
		get position() {
			return mapping.toPosition(value);
		},
		get step() {
			return step;
		},
		get orientation() {
			return orientation;
		},
		get disabled() {
			return disabled;
		},
		setPosition: (position) => {
			const next = clamp(mapping.toVolume(position), 0, 1);
			setVolume(next);
			if (muted && next > 0) {
				setMuted(false);
			}
		},
		commit: () => onValueCommit?.(value),
		toggleMuted: () => {
			if (muted && value <= 0) {
				setVolume(lastAudible);
			}
			setMuted(!muted);
		},
	});
</script>

<div
	bind:this={ref}
	role="group"
	aria-label="Volume"
	data-slot="volume-control"
	data-disabled={disabled ? "" : undefined}
	data-level={level}
	data-muted={muted ? "" : undefined}
	data-orientation={orientation}
	class={cn(
		"group/volume-control flex items-center gap-2 data-disabled:opacity-50",
		orientation === "vertical" && "flex-col-reverse",
		size === "sm" && "[--volume-thumb-size:0.75rem] [--volume-track-size:0.1875rem]",
		size === "default" && "[--volume-thumb-size:0.875rem] [--volume-track-size:0.25rem]",
		size === "lg" && "[--volume-thumb-size:1rem] [--volume-track-size:0.375rem]",
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<VolumeControlMute />
		<VolumeControlSlider />
	{/if}
</div>
