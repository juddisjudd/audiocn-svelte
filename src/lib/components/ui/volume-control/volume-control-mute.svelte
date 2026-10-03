<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type VolumeControlMuteProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		/** Renders your own element with the mute button props. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import { useVolumeControl } from "./volume-control-utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		...restProps
	}: VolumeControlMuteProps = $props();

	const volume = useVolumeControl("VolumeControlMute");
	const label = $derived(volume.muted ? "Unmute" : "Mute");

	const mergedProps = $derived(
		mergeProps(
			{
				"aria-label": label,
				"aria-pressed": volume.muted,
				class: cn(
					"text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/30 inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
					!children && "w-auto px-2",
					className
				),
				"data-level": volume.level,
				"data-muted": volume.muted ? "" : undefined,
				"data-slot": "volume-control-mute",
				disabled: volume.disabled,
				onclick: () => volume.toggleMuted(),
				type: "button" as const,
			},
			restProps
		)
	);
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} {...mergedProps}>
		{#if children}
			{@render children()}
		{:else}
			<span class="text-xs">{label}</span>
		{/if}
	</button>
{/if}
