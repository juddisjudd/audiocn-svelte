---
title: useAudioDevices
description: The list of audio input or output devices, with permission state and live updates.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-audio-devices
```

## Usage

```svelte
<script lang="ts">
	import { AudioDeviceSelect } from "#lib/components/ui/audio-device-select/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";

	const audio = useAudioDevices();
	let deviceId = $state<string | null>(null);
</script>

{#if audio.permission === "prompt"}
	<Button onclick={audio.requestPermission}>Allow microphone access</Button>
{:else}
	<AudioDeviceSelect devices={audio.devices} bind:value={deviceId} />
{/if}
```

Call it during component setup. The fields are getters, so read them from the returned object, such as `audio.devices`; destructuring them loses updates. The options can be a getter, such as `() => ({ kind })`.

Browsers hide device names until the page has microphone access. Until then devices are labelled "Microphone 1", "Microphone 2" and so on.

## Options

<PropsTable
	rows={[["kind", '"audioinput" | "audiooutput"', '"audioinput"', "Which devices to list."]]}
/>

## Returns

<PropsTable
	rows={[
		[
			"devices",
			"AudioDeviceInfo[]",
			null,
			"{ id, label, kind, groupId, isDefault }. Updates when devices are plugged in or removed.",
		],
		[
			"permission",
			'"granted" | "prompt" | "denied" | "unsupported"',
			null,
			"Microphone permission.",
		],
		["isLoading", "boolean", null, "True until the first list arrives."],
		["error", "Error | null", null, "The last error."],
		["refresh", "() => Promise<void>", null, "List devices again."],
		[
			"requestPermission",
			"() => Promise<boolean>",
			null,
			"Ask for microphone access so labels become readable.",
		],
	]}
/>
