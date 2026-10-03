<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import * as Select from "#lib/components/ui/select/index.js";
	import { cn } from "#lib/utils.js";

	export type AudioDeviceSelectTriggerProps = ComponentProps<typeof Select.Trigger>;
</script>

<script lang="ts">
	import { useAudioDeviceSelect } from "./audio-device-select-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AudioDeviceSelectTriggerProps = $props();

	const context = useAudioDeviceSelect("AudioDeviceSelectTrigger");
</script>

<Select.Trigger
	bind:ref
	class={cn("w-full min-w-0", className)}
	data-loading={context.loading ? "" : undefined}
	data-missing={context.missing ? "" : undefined}
	data-permission={context.permission}
	data-slot="audio-device-select-trigger"
	role="combobox"
	{...restProps}
/>
