<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { Orientation } from "#lib/audio/types.js";
	import type { AudioSize } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export const channelStripVariants = tv({
		base: "group/channel-strip data-selected:ring-ring/40 relative min-w-0 transition-[opacity,box-shadow] outline-none data-disabled:opacity-60 data-selected:ring-2",
		variants: {
			orientation: {
				// A row measures itself, so it can stack its header on narrow widths.
				horizontal: "@container/channel-strip w-full",
				// Console strips keep their width and let the mixer scroll instead.
				vertical: "flex h-full min-h-72 w-[var(--channel-strip-width,6.5rem)] shrink-0 flex-col",
			},
			variant: {
				card: "bg-card text-card-foreground rounded-xl border p-3 shadow-xs",
				default: "bg-muted/40 rounded-xl p-3",
				ghost: "p-2",
				master: "bg-muted/60 ring-primary/10 rounded-xl border p-3 ring-1",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
			variant: "default",
		},
	});

	/**
	 * The grid the parts place themselves on, by area name. A row stacks its
	 * header above the meter and fader until the strip is 36rem wide. The fader
	 * row exists only when a fader does: an empty one would leave the meter in
	 * the top half of the header and the value beside it.
	 */
	export const channelStripLayoutVariants = tv({
		base: "grid gap-x-3 gap-y-1.5",
		variants: {
			orientation: {
				horizontal: [
					"w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center [grid-template-areas:'header_header_header'_'meter_value_controls']",
					"has-[>[data-slot=channel-strip-notice]]:[grid-template-areas:'header_header_header'_'meter_value_controls'_'notice_notice_notice']",
					"has-[>[data-slot=channel-strip-fader]]:[grid-template-areas:'header_header_header'_'meter_value_controls'_'fader_value_controls']",
					"has-[>[data-slot=channel-strip-fader]]:has-[>[data-slot=channel-strip-notice]]:[grid-template-areas:'header_header_header'_'meter_value_controls'_'fader_value_controls'_'notice_notice_notice']",
					"@xl/channel-strip:grid-cols-[minmax(0,var(--channel-strip-header-width,12rem))_minmax(0,1fr)_auto_auto] @xl/channel-strip:[grid-template-areas:'header_meter_value_controls']",
					"@xl/channel-strip:has-[>[data-slot=channel-strip-notice]]:[grid-template-areas:'header_meter_value_controls'_'notice_notice_notice_notice']",
					"@xl/channel-strip:has-[>[data-slot=channel-strip-fader]]:[grid-template-areas:'header_meter_value_controls'_'header_fader_value_controls']",
					"@xl/channel-strip:has-[>[data-slot=channel-strip-fader]]:has-[>[data-slot=channel-strip-notice]]:[grid-template-areas:'header_meter_value_controls'_'header_fader_value_controls'_'notice_notice_notice_notice']",
				],
				vertical:
					"flex-1 grid-cols-[1fr_auto_auto_1fr] grid-rows-[auto_minmax(0,1fr)_auto_auto_auto] justify-items-center [grid-template-areas:'header_header_header_header'_'._meter_fader_.'_'value_value_value_value'_'controls_controls_controls_controls'_'notice_notice_notice_notice']",
			},
		},
		defaultVariants: { orientation: "horizontal" },
	});

	export type ChannelStripVariant = VariantProps<typeof channelStripVariants>["variant"];

	export type ChannelStripProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Horizontal is a row; vertical is a console strip. Inherited from a mixer. */
		orientation?: Orientation;
		variant?: ChannelStripVariant;
		size?: AudioSize;
		muted?: boolean;
		solo?: boolean;
		/** Silenced by another channel's solo. */
		dimmed?: boolean;
		selected?: boolean;
		/** Disables every control inside. */
		disabled?: boolean;
		/** A CSS colour for the channel's colour tag. */
		accent?: string;
		/**
		 * Renders your own root element. Spread `props` on it and `layoutProps` on
		 * the element that holds the parts.
		 */
		child?: Snippet<[{ props: Record<string, unknown>; layoutProps: Record<string, unknown> }]>;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import ChannelStripProvider from "./channel-strip-provider.svelte";

	let {
		ref = $bindable(null),
		orientation: orientationProp,
		variant = "default",
		size: sizeProp,
		muted = false,
		solo = false,
		dimmed = false,
		selected = false,
		disabled: disabledProp,
		accent,
		child,
		class: className,
		style,
		children,
		...restProps
	}: ChannelStripProps = $props();

	const config = useAudioConfig();
	const orientation = $derived(orientationProp ?? config.orientation ?? "horizontal");
	const size = $derived(sizeProp ?? config.size ?? "default");
	const disabled = $derived(disabledProp ?? config.disabled ?? false);
	const titleId = $props.id();

	const attachRoot = (root: HTMLElement) => {
		ref = root;
		if (typeof MutationObserver === "undefined") {
			return () => {
				ref = null;
			};
		}
		const update = () => {
			const clipping = root.querySelector("[data-slot='level-meter'][data-clipping]") !== null;
			root.toggleAttribute("data-clipping", clipping);
		};
		const observer = new MutationObserver(update);
		// childList too: a meter removed mid-clip must clear the strip.
		observer.observe(root, {
			attributeFilter: ["data-clipping"],
			attributes: true,
			childList: true,
			subtree: true,
		});
		update();
		return () => {
			observer.disconnect();
			ref = null;
		};
	};
	const rootAttachment = createAttachmentKey();

	const mergedProps = $derived({
		"data-dimmed": dimmed ? "" : undefined,
		"data-disabled": disabled ? "" : undefined,
		"data-muted": muted ? "" : undefined,
		"data-orientation": orientation,
		"data-selected": selected ? "" : undefined,
		"data-size": size,
		"data-slot": "channel-strip",
		"data-solo": solo ? "" : undefined,
		"data-variant": variant,
		"aria-labelledby": titleId,
		role: "group",
		...restProps,
		class: cn(
			channelStripVariants({ orientation, variant }),
			accent &&
				(orientation === "horizontal"
					? "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-(--channel-accent)"
					: "before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-(--channel-accent)"),
			className
		),
		style: accent ? `--channel-accent:${accent};${style ?? ""}` : style,
		[rootAttachment]: attachRoot,
	});

	const layoutProps = $derived({
		class: channelStripLayoutVariants({ orientation }),
		"data-slot": "channel-strip-layout",
	});
</script>

<ChannelStripProvider {dimmed} {disabled} {muted} {orientation} {size} {solo} {titleId}>
	{#if child}
		{@render child({ props: mergedProps, layoutProps })}
	{:else}
		<div {...mergedProps}>
			<div {...layoutProps}>
				{@render children?.()}
			</div>
		</div>
	{/if}
</ChannelStripProvider>
