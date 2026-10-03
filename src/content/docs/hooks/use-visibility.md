---
title: useVisibility
description: Whether an element is on screen, without state updates, so animation loops can skip frames nobody sees.
---

Every audiocn-svelte meter and visualizer that paints on animation frames uses this hook to stop painting while it is scrolled out of view.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-visibility
```

## Usage

```svelte
<script lang="ts">
	import { useVisibility } from "#lib/hooks/use-visibility.svelte.js";

	let element = $state<HTMLDivElement | null>(null);
	const visible = useVisibility(() => element);

	$effect(() => {
		let frame = requestAnimationFrame(function tick(now) {
			if (visible.current) {
				element?.style.setProperty("--angle", `${(now / 10) % 360}deg`);
			}
			frame = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frame);
	});
</script>

<div bind:this={element} class="size-4 rotate-(--angle) bg-primary"></div>
```

Call it during component setup, with the element as a getter. It returns an object whose `current` is not reactive: reading `visible.current` inside a loop costs nothing and never triggers an update. It reads `true` until the first observation, and stays `true` where `IntersectionObserver` is unavailable.

## Waking a sleeping loop

Pass `onChange` to hear when the element comes into view or leaves it. audiocn-svelte painters use it with `createFrameTask` from `#lib/audio/frame-loop.js`: a meter that is off screen, or has settled, requests no frames at all, and coming back into view wakes it.

```ts
let task: FrameTask | null = null;

const visible = useVisibility(
	() => element,
	(isVisible) => {
		if (isVisible) {
			task?.wake();
		}
	}
);
```
