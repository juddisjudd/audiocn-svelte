<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type LevelMeterChannelProps = WithElementRef<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> & {
		/** Which channel of the frames this track shows. Default 0. */
		index?: number;
	};
</script>

<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let {
		ref = $bindable(null),
		index = 0,
		class: className,
		children,
		...restProps
	}: LevelMeterChannelProps = $props();

	const context = useLevelMeterContext("LevelMeterChannel");

	const register: Attachment<HTMLDivElement> = (element) => {
		const channel = index;
		context.registerChannel(channel, element);
		return () => {
			context.registerChannel(channel, null);
		};
	};
</script>

<div
	bind:this={ref}
	{@attach register}
	data-index={index}
	data-orientation={context.orientation}
	data-slot="level-meter-channel"
	class={cn(
		"flex min-h-0 min-w-0 [--meter-hold:0] [--meter-level:0] [--meter-rms:0]",
		context.orientation === "horizontal" ? "w-full" : "h-full",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
