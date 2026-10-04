---
title: useAudioContext
description: One shared AudioContext that resumes on the first user gesture, plus a setter to supply your own.
---

<script>
	import { PropsTable } from "#lib/docs/components/index.js";
</script>

Browsers only let audio start after the user interacts with the page. Every audiocn-svelte Web Audio hook shares one `AudioContext`, and this hook resumes it on the first click, tap or key press.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-audio-context
```

## Usage

```svelte
<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { useAudioContext } from "#lib/hooks/use-audio-context.svelte.js";

	const audio = useAudioContext();
</script>

{#if audio.status === "suspended"}
	<Button onclick={audio.resume}>Enable audio</Button>
{/if}
```

Call it during component setup. `status` is a getter, so read it from the returned object instead of destructuring it.

## Your own context

Call `setAudioContext` in a component's setup to make every hook inside that component use a context you created, for example one with a specific sample rate. It replaces audiocn's `AudioContextProvider`.

```svelte
<script lang="ts">
	import { setAudioContext } from "#lib/hooks/use-audio-context.svelte.js";

	let { children } = $props();

	// AudioContext does not exist during server rendering.
	if (typeof AudioContext !== "undefined") {
		setAudioContext(new AudioContext({ sampleRate: 48_000 }));
	}
</script>

{@render children()}
```

Without it, hooks use the page-wide context from `getSharedAudioContext()`, which is `null` on the server.

## Returns

<PropsTable
	rows={[
		[
			"context",
			"AudioContext | null",
			null,
			"Null during server rendering and in browsers without Web Audio.",
		],
		[
			"status",
			'"suspended" | "running" | "closed" | "unsupported"',
			null,
			"The context state.",
		],
		[
			"resume",
			"() => Promise<void>",
			null,
			"Resume a suspended context. Call it from a user gesture.",
		],
	]}
/>
