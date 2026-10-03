<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import * as Select from "#lib/components/ui/select/index.js";
	import { cn } from "#lib/utils.js";
	import type { AudioDevice } from "./audio-device-select-context.svelte.js";

	export type AudioDeviceSelectItemProps = ComponentProps<typeof Select.Item> & {
		device?: AudioDevice;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		device,
		label,
		class: className,
		children: childrenProp,
		...restProps
	}: AudioDeviceSelectItemProps = $props();
</script>

<Select.Item
	bind:ref
	class={cn("items-start", className)}
	data-slot="audio-device-select-item"
	label={label ?? device?.label}
	{...restProps}
>
	{#snippet children(state)}
		{#if childrenProp}
			{@render childrenProp(state)}
		{:else}
			<span class="flex min-w-0 flex-col">
				<span class="flex items-center gap-2">
					<span class="truncate">{device?.label}</span>
					{#if device?.isDefault && !device.label.startsWith("Default")}
						<span class="text-xs text-muted-foreground">Default</span>
					{/if}
				</span>
				{#if device?.description}
					<span class="text-xs text-muted-foreground">
						{device.description}
					</span>
				{/if}
			</span>
		{/if}
	{/snippet}
</Select.Item>
