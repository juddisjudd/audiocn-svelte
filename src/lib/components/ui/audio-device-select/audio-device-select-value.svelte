<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import * as Select from "#lib/components/ui/select/index.js";
	import { cn } from "#lib/utils.js";

	export type AudioDeviceSelectValueProps = Omit<
		ComponentProps<typeof Select.Value>,
		"children" | "child" | "placeholder"
	> & {
		/** Shown with no selection. Default "Select a device". */
		placeholder?: string;
	};
</script>

<script lang="ts">
	import { useAudioDeviceSelect } from "./audio-device-select-context.svelte.js";

	let {
		ref = $bindable(null),
		placeholder = "Select a device",
		class: className,
		...restProps
	}: AudioDeviceSelectValueProps = $props();

	const context = useAudioDeviceSelect("AudioDeviceSelectValue");
</script>

<Select.Value
	bind:ref
	class={cn("truncate", className)}
	data-slot="audio-device-select-value"
	{...restProps}
>
	{#snippet children({ selection })}
		{@const selected = selection.type === "single" ? (selection.selected?.value ?? null) : null}
		{#if selected === null}
			<span class="text-muted-foreground">
				{context.loading ? "Finding devices…" : placeholder}
			</span>
		{:else}
			{context.items.find((item) => item.value === selected)?.label ?? placeholder}
		{/if}
	{/snippet}
</Select.Value>
