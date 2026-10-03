---
title: Installation
description: Add audiocn-svelte components to a shadcn-svelte project with the shadcn-svelte CLI.
---

<script>
	import { Step, Steps } from "#lib/docs/components/index.js";
</script>

audiocn-svelte is a [shadcn-svelte registry](https://shadcn-svelte.com/docs/registry). You add components with the same `shadcn-svelte` CLI you already use, and the code lands in your project.

## Requirements

- Svelte 5 and Tailwind CSS v4. Components use runes, so they need Svelte 5.
- A project set up with shadcn-svelte. audiocn-svelte components use the standard shadcn tokens (`background`, `muted`, `primary`, `ring`…) and the `cn` helper from your `utils` alias.
- Components are built on [bits-ui](https://bits-ui.com). The CLI installs `bits-ui` for you if your project does not have it yet.

<Steps>

<Step>

### Set up shadcn-svelte

Skip this if your project already has a `components.json`.

```npm
npx shadcn-svelte@latest init
```

</Step>

<Step>

### Check your aliases

The CLI writes files to the aliases in `components.json`. In a SvelteKit 3 project they use the `#lib` subpath import:

```json title="components.json"
{
	"aliases": {
		"components": "#lib/components",
		"ui": "#lib/components/ui",
		"hooks": "#lib/hooks",
		"utils": "#lib/utils",
		"lib": "#lib"
	}
}
```

SvelteKit 2 projects use `$lib` instead. Either works: the CLI rewrites every import to your aliases.

</Step>

<Step>

### Add a component

```npm
npx shadcn-svelte@latest add @audiocn-svelte/level-meter
```

The CLI copies the component and everything it depends on: the audio core (`lib/audio`), the audio theme tokens, and any hooks it uses.

</Step>

<Step>

### Use it

```svelte
<script lang="ts">
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";

	let { peakDb }: { peakDb: number } = $props();
</script>

<LevelMeter aria-label="Microphone level" {peakDb} />
```

</Step>

</Steps>

## What gets installed

| Path                        | What it is                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `lib/components/ui/*`       | The components, one folder each                                                                                         |
| `lib/hooks/use-*.svelte.ts` | Hooks: frame sources, Web Audio, mixer state                                                                            |
| `lib/audio/*.ts`            | The audio core: decibels, ballistics, tapers, types                                                                     |
| Your global CSS file        | Six audio tokens: `--meter-ok`, `--meter-warn`, `--meter-clip`, `--channel-mute`, `--channel-solo`, `--channel-monitor` |

The paths follow the aliases in your `components.json`, so they adapt to projects with custom aliases.

## Existing projects

- `channel-strip` uses the shadcn-svelte `badge`. If you have customised yours, answer **No** when the CLI asks to overwrite it.
- The six audio tokens land in your global CSS file (the `tailwind.css` path in `components.json`). If your theme already has status colours, point the tokens at them instead (see [Theming](/docs/concepts/theming)).
- The code compiles against an ES2022 `lib`.

## Install everything

Every block pulls in the components it uses. The full mixer installs most of the library in one step:

```npm
npx shadcn-svelte@latest add @audiocn-svelte/system-audio-mixer
```
