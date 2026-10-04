---
title: useReducedMotion
description: True when the user asked the system to reduce motion.
---

Meters and visualizers use this to show a static level instead of animating.

```npm
npx shadcn-svelte@latest add @audiocn-svelte/use-reduced-motion
```

```ts
import { useReducedMotion } from "#lib/hooks/use-reduced-motion.svelte.js";

const reducedMotion = useReducedMotion();
```

It returns Svelte's [`prefersReducedMotion`](https://svelte.dev/docs/svelte/svelte-motion#prefersReducedMotion), so read `reducedMotion.current`. It is `false` during server rendering and updates when the setting changes.
