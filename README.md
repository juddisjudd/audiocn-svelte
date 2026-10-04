# audiocn-svelte

Audio components for Svelte, built the shadcn-svelte way. Level meters, visualizers, faders, knobs, channel strips, a full mixer, players and sound pads.

This is a Svelte 5 port of [audiocn](https://github.com/audiocn/ui) by OrcDev and fortysevenfx. It keeps audiocn's components, names, data attributes, styling and behaviour, and changes the API only where Svelte has its own conventions. The relationship is the same as the one between shadcn-svelte and shadcn/ui.

Docs and live demos: [juddisjudd.github.io/audiocn-svelte](https://juddisjudd.github.io/audiocn-svelte)

## What you get

- **Your code.** It is not a package. The shadcn-svelte CLI copies each component into your project, with everything it depends on.
- **Themed by shadcn.** Built on [bits-ui](https://bits-ui.com), styled with Tailwind CSS v4, and themed with the shadcn CSS variables. Any shadcn-svelte theme restyles it.
- **Frame-rate painting.** Meters and visualizers paint on the animation frame, straight to the DOM or a canvas. They never write Svelte state per frame.
- **Bring your own audio.** Components take levels and values. They never open a microphone themselves. Use the included Web Audio hooks, or feed them from any other engine.
- **Real units.** Mixer components work in decibels.
- **Accessible.** Every fader, knob and strip works from the keyboard, with ARIA roles and reduced-motion support.

## Components

**Meters and visualizers**

| Component               | What it does                                                                    |
| ----------------------- | ------------------------------------------------------------------------------- |
| Level Meter             | Peak and RMS meter with zones, peak hold, a scale, a readout and a clip light   |
| dB Scale                | Tick marks and labels for a decibel range                                       |
| dB Readout              | A numeric level that updates at a readable rate and never shifts the layout     |
| Clip Indicator          | A clip light that holds after the signal clips, with a count and click to reset |
| Bar Visualizer          | Bars driven by frequency bands, with idle, loading and mirrored modes           |
| Electric Bar Visualizer | Bars drawn as crackling filaments, with arcs and sparks                         |
| Electric Waveform       | One electric line with a white-hot core, a glow, forks and sparks               |
| Smooth Waveform         | A clean line that follows the sound, as a wave or an oscilloscope trace         |
| Live Waveform           | A canvas waveform of a live signal, as scrolling history or the current frame   |
| Waveform                | A clip's waveform with a playhead, seeking, hover time, regions and markers     |
| Spectrum                | A frequency spectrum analyser with axes, a grid and peak hold                   |

**Controls**

| Component           | What it does                                                                           |
| ------------------- | -------------------------------------------------------------------------------------- |
| Fader               | A volume fader in decibels, with tapers, detents, a scale, reset and an editable value |
| Parameter Slider    | A labelled slider with a numeric input, unit, marks and reset                          |
| Knob                | A rotary control drawn in SVG                                                          |
| Pan Control         | Left and right balance with a centre detent                                            |
| Channel Toggle      | Mute, solo and monitor buttons                                                         |
| Volume Control      | A volume slider with a mute button, for players                                        |
| Audio Device Select | A microphone, speaker or source picker with permission and disconnected states         |

**Mixer**

| Component     | What it does                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| Channel Strip | One mixer channel, as a row or a console strip                                       |
| Mixer         | The container for channel strips, with shared meter settings and keyboard navigation |

**Sounds and music**

| Component    | What it does                                                                        |
| ------------ | ----------------------------------------------------------------------------------- |
| Audio Player | A composable player with transport, seeking, time, volume, rate, loop and shortcuts |
| Track List   | Tracks with active and playing states and arrow-key navigation                      |
| Sound Pad    | A trigger pad with modes, a hotkey, playback progress and an accent colour          |

## Blocks

Complete features built from the components: System Audio Mixer, Music Player, Soundboard, Microphone Setup, Quick Audio Popover and System Audio Settings.

## Hooks

Web Audio plumbing, written with Svelte 5 runes: `useMicrophone`, `useSystemAudio`, `useAudioAnalyser`, `useWebAudioMixer`, `useMixer`, `useAudioPlayer`, `useSound`, `useWaveformData`, `useAudioDevices` and `useDemoSignal`. There are also `useAudioContext`, `useFrameSource`, `useLevel`, `useClipHold`, `useReducedMotion`, `useVisibility`, `useGainNode` and `useAudioConfig`.

Call hooks during component setup. Pass reactive inputs as getters, and read results through their properties instead of destructuring them:

```svelte
<script lang="ts">
	import { useLevel } from "$lib/hooks/use-level.svelte.js";

	let { source } = $props();
	const level = useLevel(() => source);
</script>

<span>{level.peakDb.toFixed(1)} dB</span>
```

## Quick start

You need Svelte 5, Tailwind CSS v4 and a project set up with [shadcn-svelte](https://shadcn-svelte.com/docs/installation).

Add a component by its registry URL. The CLI also installs the audio core, the audio colour tokens and any hooks the component uses.

```bash
npx shadcn-svelte@latest add https://juddisjudd.github.io/audiocn-svelte/r/level-meter.json
npx shadcn-svelte@latest add https://juddisjudd.github.io/audiocn-svelte/r/system-audio-mixer.json
```

Then use it:

```svelte
<script lang="ts">
	import { LevelMeter } from "$lib/components/ui/level-meter/index.js";

	let { peakDb }: { peakDb: number } = $props();
</script>

<LevelMeter aria-label="Microphone level" {peakDb} />
```

## Differences from audiocn

| audiocn (React)                                   | audiocn-svelte                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `value`, `defaultValue` and `onValueChange`       | `bind:value`, or `value` with `onValueChange`                                |
| `onValueCommitted`                                | `onValueCommit`, the bits-ui name                                            |
| `actionsRef` handles                              | Exported functions reached through `bind:this`, such as `meter.paint(frame)` |
| `render` prop                                     | `child` snippet                                                              |
| `<AudioContextProvider>`, `<AudioConfigProvider>` | `setAudioContext()`, `setAudioConfig()`                                      |
| Base UI                                           | bits-ui                                                                      |
| `class-variance-authority`                        | `tailwind-variants`                                                          |

[`PORTING.md`](./PORTING.md) has the full mapping.

## Develop

This repository holds the docs site, the registry source and the component source, in one SvelteKit app. The docs are built with [svocs](https://svocs.dev). Its files were copied from the svocs template; `.svocs.json` lists them, so `npx svocs-cli doctor` can check the setup.

| Path                         | What it is                                                                 |
| ---------------------------- | -------------------------------------------------------------------------- |
| `src/lib/components/ui/`     | Components, both audiocn-svelte's and the shadcn-svelte ones the site uses |
| `src/lib/components/blocks/` | Blocks                                                                     |
| `src/lib/hooks/`             | Hooks                                                                      |
| `src/lib/audio/`             | The audio core: decibel maths, ballistics, tapers, the frame loop          |
| `src/lib/docs/examples/`     | Docs previews                                                              |
| `content/`                   | Docs pages: svocs markdown, `.svx` where a page uses components            |
| `src/lib/docs/`              | Docs widgets (previews, install commands, props tables) and the home page  |
| `registry.json`              | The registry. `pnpm registry:build` writes `static/r/`                     |

```bash
pnpm install
pnpm dev              # docs site on http://localhost:5173
pnpm test             # unit and component tests (Vitest, jsdom)
pnpm test:e2e         # browser tests of the built site (Playwright, Chrome)
pnpm check            # svelte-check
pnpm lint             # Prettier and ESLint
pnpm build            # registry, static site, search index and social cards
pnpm test:install     # installs every item into fresh SvelteKit 2 and 3 apps and type-checks them
```

## Licence

[MIT](./LICENSE). audiocn is MIT licensed by OrcDev; its copyright notice is kept in `LICENSE`.
