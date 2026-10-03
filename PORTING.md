# Porting audiocn to Svelte

audiocn-svelte is a Svelte 5 port of [audiocn](https://github.com/audiocn/ui) (MIT). Every item keeps audiocn's name, props, data attributes, class strings and behaviour, translated to the shadcn-svelte conventions below. The test for every component: a developer who knows shadcn-svelte can guess its API.

The React source is the reference. Its plans (`plans/002-conventions.md` to `008-blocks.md`) are the specs.

## Stack

| React (audiocn)                    | Svelte (this repo)                     |
| ---------------------------------- | -------------------------------------- |
| Next.js 16, React 19               | SvelteKit 3, Svelte 5 runes            |
| Base UI (`@base-ui/react`)         | bits-ui                                |
| `class-variance-authority` (`cva`) | `tailwind-variants` (`tv`)             |
| `@phosphor-icons/react`            | `phosphor-svelte` (same `*Icon` names) |
| `sonner`                           | `svelte-sonner`                        |
| shadcn CLI and registry            | shadcn-svelte CLI and registry         |
| Testing Library React, jsdom       | Testing Library Svelte, jsdom          |

## Layout

| React                       | Svelte                                                                                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/audio/*.ts`            | `src/lib/audio/*.ts` (copied unchanged)                                                                                                                                       |
| `lib/electric.ts`           | `src/lib/electric.ts`                                                                                                                                                         |
| `hooks/use-x.ts`            | `src/lib/hooks/use-x.svelte.ts`                                                                                                                                               |
| `components/ui/x.tsx`       | `src/lib/components/ui/x/`: `x.svelte` (root), `x-<part>.svelte` (one per part), `index.ts`, and optional `x-context.svelte.ts` or `x-utils.ts` for logic shared by the parts |
| `components/blocks/x/*.tsx` | `src/lib/components/blocks/x/*.svelte` and `index.ts`                                                                                                                         |
| `*.test.tsx`                | `*.test.ts`, or `*.svelte.test.ts` when the test uses runes, next to the code. Test harness components are `*.test.svelte`.                                                   |

`index.ts` follows shadcn-svelte: export each part by its short name and by its full name, plus the variants and prop types.

```ts
import Root from "./level-meter.svelte";
import Track from "./level-meter-track.svelte";

export { levelMeterVariants, type LevelMeterProps } from "./level-meter.svelte";
export {
	Root,
	Track,
	//
	Root as LevelMeter,
	Track as LevelMeterTrack,
};
```

## Imports

- Import through `#lib/...` (SvelteKit 3 subpath imports), with `.js` on TypeScript modules: `#lib/audio/decibels.js`, `#lib/hooks/use-frame-source.svelte.js`, `#lib/utils.js`, `#lib/components/ui/db-scale/index.js`.
- Inside one component folder, import parts relatively: `./level-meter-track.svelte`.
- Never use `$lib`. The registry build turns `#lib` paths into placeholders, and the CLI rewrites them to each consumer's alias.

## Components

- Svelte 5 runes only. Props through `$props()`.
- Every part takes `ref = $bindable(null)`, `class: className` and `...restProps`. Put `data-slot` before `{...restProps}`, and merge classes with `cn(..., className)` so the user's classes win.
- Type props as `WithElementRef<HTMLAttributes<HTMLDivElement>> & OwnProps` (`WithElementRef` from `#lib/utils.js`, element types from `svelte/elements`). Export prop types and variants from `<script lang="ts" module>`. The module and instance scripts share one scope: import a name once.
- `cva` becomes `tv` with the same class strings, exported as `<name>Variants`.
- A Base UI primitive becomes the bits-ui primitive of the same kind (Slider, Toggle, Switch, Select, Popover, Tooltip, Tabs, ScrollArea, ContextMenu, Meter, Button). Check bits-ui's props and data attributes in its docs (`https://bits-ui.com/llms.txt` or Context7 `/huntabyte/bits-ui`). Translate Base UI state selectors in class strings to the bits-ui equivalent: `data-pressed:` becomes `aria-pressed:` or `data-[state=on]:`, and so on.
- Keep audiocn's own data attributes exactly (`data-slot`, `data-zone`, `data-clipping`, `data-active`, `data-muted`, `data-solo`, `data-dimmed`, `data-playing`, `data-dragging`, ...). They are public theming API.
- `useRender` and the `render` prop become a bits-ui style `child` snippet: `{#if child}{@render child({ props: mergedProps })}{:else}<button {...mergedProps}>...</button>{/if}`, with `mergeProps` from `bits-ui`.
- `children: ReactNode` becomes `children?: Snippet`. Render-prop children become snippets with arguments.
- `actionsRef` handles become exported functions on the component (`export function paint(frame: MeterFrame) {}`), reached through `bind:this`. Keep the method names and export the `*Actions` interface.
- Controlled state follows bits-ui: `value = $bindable(<default>)`, `onValueChange?: (value) => void`, `onValueCommit?: (value) => void`. `defaultValue` becomes the bindable's default. `onValueCommitted` becomes `onValueCommit`. The same applies to `pressed`, `checked` and `open`.
- Hot paths stay off the reactive graph. Meters and visualizers paint by writing to the DOM or a canvas from a frame callback or the shared frame loop (`#lib/audio/frame-loop.js`), never through `$state` on every frame. Values React kept in `useRef` are plain `let` variables.
- `useEffect` becomes `$effect` with a returned teardown. Read values the effect must not depend on inside `untrack`. `useEffectEvent` is not needed: props are live, so a callback reads the current prop. `useMemo` becomes `$derived`, `useState` becomes `$state`, `useCallback` becomes a plain function, `useId` becomes `$props.id()`.
- Element refs: `bind:this` into a `$state(null)` variable, or the `ref` bindable.
- JSX attributes become HTML attributes: `class`, `for`, `tabindex`, lowercase events (`onclick`, `onpointerdown`). `style={{ ... }}` becomes `style:prop={...}`; CSS variables use `style:--meter-level={x}`.
- When a component sets its own handler and also spreads `restProps`, chain the user's handler (`mergeProps`, or call `restProps.onclick?.(event)`), so neither is lost.
- No icon imports in `ui` components. Icons are children. Blocks use `phosphor-svelte`.
- Components render on the server. Touch browser APIs only in `$effect`, event handlers, or behind `typeof window` checks. Drop `"use client"`.
- Formatting: tabs and double quotes. Keep the React file's comments where they are still true. Add no change-narration comments.

## Hooks

- `src/lib/hooks/use-x.svelte.ts`, with the same exported names, option names and defaults.
- Hooks use `$effect` and context, so they are called during component setup.
- Reactive inputs are `MaybeGetter<T>` from `runed`, read with `extract()`. That covers positional arguments and the options object as a whole: `useLevel(() => source, () => ({ intervalMs }))`.
- Return an object with getters for reactive fields (`readonly` in the interface), never a bare primitive. Functions stay plain.
- React context providers become `setContext`/`getContext` with a `Symbol` key, exposed as `setX()` and `useX()`. Done so far: `setAudioConfig`/`useAudioConfig`, `setAudioContext`/`useAudioContext`. If a React component wraps only part of its tree in a provider, add a small internal component in the same folder that calls the setter and renders `children`.
- Already ported: `use-frame-source`, `use-audio-config`, `use-audio-context`, `use-reduced-motion` (returns `{ current }`), `use-visibility` (returns non-reactive `{ current }`), `use-clip-hold`, `use-level`.

## Tests

- Vitest, jsdom and `@testing-library/svelte`. Port each React test with the same names and assertions.
- `#test/fake-frames.js` (`useFakeFrames`, `advance`) and `#test/fake-audio.js` are ported. `advance` flushes Svelte updates.
- `act()` becomes `flushSync()` from `svelte` (or `await tick()`). `renderHook` becomes a small harness component that calls the hook, or `$effect.root` in a `*.svelte.test.ts` file.
- Pass snippets in tests with `createRawSnippet` or through a harness component.
- Run one area: `pnpm vitest run src/lib/components/ui/level-meter`.

## Checks

- Type-check: `pnpm check`. Other work may be in progress in the same tree; only errors in your own files count.
- Run the Svelte MCP autofixer (`svelte-autofixer`) on each `.svelte` file you write.
- Registry: `registry.json` lists every item. Items name shadcn-svelte dependencies bare (`"select"`) and their own with `local:` (`"local:core"`). `pnpm registry:build` writes `static/r/`.
