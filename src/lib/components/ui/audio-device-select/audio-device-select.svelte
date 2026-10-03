<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { AudioDevice, AudioDevicePermission } from "./audio-device-select-context.svelte.js";

	export type AudioDeviceSelectProps = {
		devices: AudioDevice[];
		/** The selected device id. `null` is no selection, or "None" with `allowNone`. */
		value?: string | null;
		onValueChange?: (id: string | null) => void;
		/** Adds a "None" item. Default false. */
		allowNone?: boolean;
		/** Default "None". */
		noneLabel?: string;
		/** Shows "Finding devices…". Default false. */
		loading?: boolean;
		/** Microphone permission. Default `granted`. */
		permission?: AudioDevicePermission;
		onRequestPermission?: () => void;
		disabled?: boolean;
		children?: Snippet;
	};

	const NONE_VALUE = "__none__";
</script>

<script lang="ts">
	import * as Select from "#lib/components/ui/select/index.js";
	import { setAudioDeviceSelect, type DeviceItem } from "./audio-device-select-context.svelte.js";
	import AudioDeviceSelectContent from "./audio-device-select-content.svelte";
	import AudioDeviceSelectTrigger from "./audio-device-select-trigger.svelte";
	import AudioDeviceSelectValue from "./audio-device-select-value.svelte";

	let {
		devices,
		value = $bindable(null),
		onValueChange,
		allowNone = false,
		noneLabel = "None",
		loading = false,
		permission = "granted",
		onRequestPermission,
		disabled,
		children,
	}: AudioDeviceSelectProps = $props();

	// Labels of every device seen, so a disconnected one keeps its name. Not
	// reactive: it is written while `items` is derived.
	const knownLabels: Record<string, string> = Object.create(null);

	const missing = $derived(
		value !== null && !loading && !devices.some((device) => device.id === value)
	);

	const items = $derived.by(() => {
		for (const device of devices) {
			knownLabels[device.id] = device.label;
		}
		const list: DeviceItem[] = [];
		if (allowNone) {
			list.push({ label: noneLabel, none: true, value: NONE_VALUE });
		}
		for (const device of devices) {
			list.push({ device, label: device.label, value: device.id });
		}
		if (missing && value !== null) {
			const remembered = knownLabels[value] ?? "Unknown device";
			list.push({
				label: `${remembered} (disconnected)`,
				missing: true,
				value,
			});
		}
		return list;
	});

	// The select has no null; "" is no selection.
	const selected = $derived(value ?? (allowNone ? NONE_VALUE : ""));

	setAudioDeviceSelect({
		get items() {
			return items;
		},
		get loading() {
			return loading;
		},
		get missing() {
			return missing;
		},
		get onRequestPermission() {
			return onRequestPermission;
		},
		get permission() {
			return permission;
		},
	});

	const handleValueChange = (next: string) => {
		const id = next === NONE_VALUE || next === "" ? null : next;
		value = id;
		onValueChange?.(id);
	};
</script>

<Select.Root type="single" {disabled} onValueChange={handleValueChange} value={selected}>
	{#if children}
		{@render children()}
	{:else}
		<AudioDeviceSelectTrigger>
			<AudioDeviceSelectValue />
		</AudioDeviceSelectTrigger>
		<AudioDeviceSelectContent />
	{/if}
</Select.Root>
