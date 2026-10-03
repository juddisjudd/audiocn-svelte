---
title: Audio Device Select
description: A microphone, speaker or source picker with permission, loading and disconnected states.
---

<script>
	import { ComponentPreview, PropsTable } from "#lib/docs/components/index.js";
</script>

<ComponentPreview name="audio-device-select-demo" />

## Installation

```npm
npx shadcn-svelte@latest add @audiocn-svelte/audio-device-select
```

## Usage

```svelte
<script lang="ts">
	import { AudioDeviceSelect } from "#lib/components/ui/audio-device-select/index.js";
	import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";

	const audioDevices = useAudioDevices();
	let deviceId = $state<string | null>(null);
</script>

<AudioDeviceSelect
	devices={audioDevices.devices}
	onRequestPermission={audioDevices.requestPermission}
	permission={audioDevices.permission}
	bind:value={deviceId}
/>
```

Devices come in as a prop, so the select works with [`useAudioDevices`](/docs/hooks/use-audio-devices) or with any device list, such as one from a native backend.

## Anatomy

```svelte
<AudioDeviceSelect {devices}>
	<AudioDeviceSelectTrigger>
		<AudioDeviceSelectValue placeholder="Select a microphone" />
	</AudioDeviceSelectTrigger>
	<AudioDeviceSelectContent />
	<AudioDeviceSelectPreview>
		<LiveWaveform source={analyser.visual} />
	</AudioDeviceSelectPreview>
</AudioDeviceSelect>
```

`AudioDeviceSelectContent` renders one item per device. Pass children to render items yourself with `AudioDeviceSelectItem`.

## Examples

### States

Selected device, a "None" option, a device that was unplugged, and loading.

<ComponentPreview name="audio-device-select-states" />

## Behaviour

- A selected device that disappears is kept and shown as "(disconnected)", so the selection is never lost silently.
- Devices with `status` `unavailable` or `permission-required` are disabled.
- The default device is marked.

## Theming

| Data attribute    | On      | Meaning                         |
| ----------------- | ------- | ------------------------------- |
| `data-loading`    | trigger | Devices are loading             |
| `data-permission` | trigger | `granted`, `prompt` or `denied` |
| `data-missing`    | trigger | The selected device is gone     |

## API reference

<PropsTable
	rows={[
		["devices", "AudioDevice[]", null, "{ id, label, isDefault?, status?, description? }."],
		[
			"value",
			"string | null",
			"null",
			"The device id. null is no selection, or None with allowNone. Bindable.",
		],
		["onValueChange", "(id: string | null) => void", null, null],
		["allowNone", "boolean", "false", "Adds a None item."],
		["noneLabel", "string", '"None"', null],
		["loading", "boolean", "false", 'Shows "Finding devices…".'],
		["permission", '"granted" | "prompt" | "denied"', '"granted"', null],
		[
			"onRequestPermission",
			"() => void",
			null,
			'Shows an "Allow access" button when permission is needed.',
		],
		["disabled", "boolean", "false", null],
	]}
/>
