<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import * as Select from "#lib/components/ui/select/index.js";

	export type AudioDeviceSelectContentProps = ComponentProps<typeof Select.Content>;
</script>

<script lang="ts">
	import { useAudioDeviceSelect } from "./audio-device-select-context.svelte.js";
	import AudioDeviceSelectItem from "./audio-device-select-item.svelte";
	import AudioDeviceSelectPermission from "./audio-device-select-permission.svelte";

	let { ref = $bindable(null), children, ...restProps }: AudioDeviceSelectContentProps = $props();

	const context = useAudioDeviceSelect("AudioDeviceSelectContent");
	const needsPermission = $derived(context.permission !== "granted");
</script>

<Select.Content bind:ref data-slot="audio-device-select-content" {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<Select.Group>
			{#if needsPermission}
				<AudioDeviceSelectPermission />
			{/if}
			{#if context.loading}
				<Select.Item disabled label="Finding devices…" value="__loading__" />
			{/if}
			{#each context.items as item, index (index)}
				{#if item.none || item.missing}
					<Select.Item disabled={item.missing} label={item.label} value={item.value} />
				{:else}
					<AudioDeviceSelectItem
						device={item.device}
						disabled={(item.device?.status ?? "available") !== "available"}
						value={item.value}
					/>
				{/if}
			{/each}
			{#if !context.loading && context.items.length === 0 && !needsPermission}
				<p class="p-2 text-xs text-muted-foreground">No devices found.</p>
			{/if}
		</Select.Group>
	{/if}
</Select.Content>
