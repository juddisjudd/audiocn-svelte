<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export const channelStripNoticeVariants = tv({
		base: "flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs [grid-area:notice] [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground",
				destructive: "bg-destructive/10 text-destructive",
				warning: "bg-meter-warn/15 text-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	});

	export type ChannelStripNoticeVariant = VariantProps<typeof channelStripNoticeVariants>["variant"];

	export type ChannelStripNoticeProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: ChannelStripNoticeVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = "default",
		class: className,
		children,
		...restProps
	}: ChannelStripNoticeProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="channel-strip-notice"
	data-variant={variant}
	role={variant === "destructive" ? "alert" : "status"}
	class={cn(channelStripNoticeVariants({ variant }), "w-full", className)}
	{...restProps}
>
	{@render children?.()}
</div>
