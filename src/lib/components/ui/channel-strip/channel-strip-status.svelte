<script lang="ts" module>
	import type { ComponentProps } from "svelte";

	import { Badge } from "#lib/components/ui/badge/index.js";

	export type ChannelStripStatusTone = "default" | "live" | "muted" | "warning" | "error";

	export type ChannelStripStatusProps = ComponentProps<typeof Badge> & {
		tone?: ChannelStripStatusTone;
	};

	const STATUS_CLASS = {
		default: "",
		error: "",
		live: "bg-meter-ok/15 text-meter-ok-foreground",
		muted: "bg-channel-mute/15 text-channel-mute-foreground",
		warning: "bg-meter-warn/20 text-foreground",
	} as const;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		tone = "default",
		class: className,
		children,
		...restProps
	}: ChannelStripStatusProps = $props();

	const variant = $derived.by(() => {
		if (tone === "error") {
			return "destructive";
		}
		if (tone === "default") {
			return "secondary";
		}
		return "outline";
	});
</script>

<Badge
	bind:ref
	data-slot="channel-strip-status"
	data-tone={tone}
	{variant}
	class={cn("shrink-0", STATUS_CLASS[tone], className)}
	{...restProps}
>
	{@render children?.()}
</Badge>
