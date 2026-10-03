<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { Toggle as TogglePrimitive } from "bits-ui";

	export const channelToggleVariants = tv({
		base: "group/channel-toggle focus-visible:ring-ring/30 inline-flex shrink-0 items-center justify-center gap-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
		variants: {
			size: {
				default: "h-7 min-w-7 px-1.5",
				icon: "size-7",
				lg: "h-8 min-w-8 px-2",
				sm: "h-6 min-w-6 px-1",
			},
			tone: {
				monitor:
					"aria-pressed:border-channel-monitor/40 aria-pressed:bg-channel-monitor/15 aria-pressed:text-channel-monitor-foreground",
				mute: "aria-pressed:border-channel-mute/40 aria-pressed:bg-channel-mute/15 aria-pressed:text-channel-mute-foreground",
				neutral: "aria-pressed:bg-foreground aria-pressed:text-background",
				solo: "aria-pressed:border-channel-solo/50 aria-pressed:bg-channel-solo/20 aria-pressed:text-channel-solo-foreground",
			},
			variant: {
				default: "bg-muted text-muted-foreground hover:text-foreground",
				ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
				outline:
					"border-border text-muted-foreground hover:bg-muted hover:text-foreground border bg-transparent",
			},
		},
		defaultVariants: {
			size: "default",
			tone: "neutral",
			variant: "default",
		},
	});

	export type ChannelToggleSize = VariantProps<typeof channelToggleVariants>["size"];
	export type ChannelToggleTone = VariantProps<typeof channelToggleVariants>["tone"];
	export type ChannelToggleVariant = VariantProps<typeof channelToggleVariants>["variant"];

	export type ChannelToggleProps = TogglePrimitive.RootProps & {
		size?: ChannelToggleSize;
		tone?: ChannelToggleTone;
		variant?: ChannelToggleVariant;
	};
</script>

<script lang="ts">
	import { useAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		class: className,
		tone = "neutral",
		variant = "default",
		size = "default",
		disabled,
		...restProps
	}: ChannelToggleProps = $props();

	const config = useAudioConfig();
</script>

<TogglePrimitive.Root
	bind:ref
	bind:pressed
	data-slot="channel-toggle"
	data-tone={tone}
	disabled={disabled ?? config.disabled}
	class={cn(channelToggleVariants({ size, tone, variant }), className)}
	{...restProps}
/>
