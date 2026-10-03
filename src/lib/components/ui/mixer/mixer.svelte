<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { BallisticsInput } from "#lib/audio/ballistics.js";
	import type { MeterZone, Orientation } from "#lib/audio/types.js";
	import { type AudioSize, setAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type MixerProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/**
		 * `horizontal` stacks row strips; `vertical` lays console strips side by
		 * side. Default `horizontal`.
		 */
		orientation?: Orientation;
		size?: AudioSize;
		/** Shared meter range. */
		minDb?: number;
		maxDb?: number;
		/** Shared meter zones. */
		zones?: MeterZone[];
		/** Shared meter movement. */
		ballistics?: BallisticsInput;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { setMixerContext } from "./mixer-context.svelte.js";

	let {
		ref = $bindable(null),
		orientation = "horizontal",
		size,
		minDb,
		maxDb,
		zones,
		ballistics,
		disabled,
		class: className,
		children,
		...restProps
	}: MixerProps = $props();

	const titleId = $props.id();
	const stripOrientation: Orientation = $derived(
		orientation === "horizontal" ? "horizontal" : "vertical"
	);

	setMixerContext({
		get orientation() {
			return orientation;
		},
		titleId,
	});

	setAudioConfig(() => ({
		ballistics,
		disabled,
		maxDb,
		minDb,
		orientation: stripOrientation,
		size,
		zones,
	}));
</script>

<div
	bind:this={ref}
	aria-labelledby={titleId}
	data-orientation={orientation}
	data-size={size}
	data-slot="mixer"
	role="group"
	class={cn(
		"group/mixer grid min-w-0 gap-3 [--mixer-gap:0.5rem]",
		orientation === "horizontal"
			? "grid-cols-1 [grid-template-areas:'header'_'channels'_'separator'_'master']"
			: "grid-cols-[minmax(0,1fr)_auto_auto] grid-rows-[auto_minmax(0,1fr)] [grid-template-areas:'header_header_header'_'channels_separator_master']",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
