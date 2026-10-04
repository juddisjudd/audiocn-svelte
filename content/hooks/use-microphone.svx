---
title: useMicrophone
description: Open a microphone as a MediaStream, with browser processing off by default.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-microphone
```

## Usage

```svelte
<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	let { deviceId }: { deviceId: string | null } = $props();

	const microphone = useMicrophone(() => ({ deviceId }));
	const analyser = useAudioAnalyser(() => microphone.stream);
</script>

<Button onclick={microphone.start}>Start</Button>
```

Call it during component setup. Pass the options as a getter, as above, so a new `deviceId` reopens the stream. `stream`, `status` and `error` are getters: read them from the returned object, and pass `() => microphone.stream` to other hooks. `start()` and `stop()` override `enabled` until it changes.

Echo cancellation, noise suppression and automatic gain control are off by default. Browsers turn them on for calls, but they change the level a meter shows. Turn them on when you want call-style audio.

## Options

<PropsTable
	rows={[
		[
			"deviceId",
			"string | null",
			null,
			"The device to open. Omit for the system default. Changing it reopens the stream.",
		],
		["enabled", "boolean", "false", "Open the microphone as soon as possible."],
		["echoCancellation", "boolean", "false", "Browser echo cancellation."],
		["noiseSuppression", "boolean", "false", "Browser noise suppression."],
		["autoGainControl", "boolean", "false", "Browser automatic gain control."],
		["channelCount", "number", null, "Requested channel count."],
	]}
/>

## Returns

<PropsTable
	rows={[
		["stream", "MediaStream | null", null, "The open stream."],
		[
			"status",
			'"idle" | "acquiring" | "active" | "denied" | "unavailable" | "error"',
			null,
			"unavailable also covers a device that was unplugged.",
		],
		["error", "Error | null", null, "The last error."],
		["start", "() => Promise<void>", null, "Open the microphone."],
		["stop", "() => void", null, "Close it and release the device."],
	]}
/>
