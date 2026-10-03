---
title: Introduction
description: Audio components for Svelte, built the shadcn way.
---

audiocn-svelte is a set of audio components for Svelte: level meters, visualizers, faders, channel strips, a complete mixer, players and sound pads. It is a Svelte 5 port of [audiocn](https://github.com/audiocn/ui), with the same names, props and behaviour.

It is not a package you install. Like shadcn-svelte, each component is copied into your project with the shadcn-svelte CLI, so you own the code and can change anything.

## What makes it different

- **Built on bits-ui**, styled with Tailwind CSS, and themed with the same CSS variables as shadcn-svelte. Any shadcn theme restyles audiocn-svelte.
- **Fast by default.** Meters and visualizers paint on the animation frame without going through Svelte state, so a mixer with many channels stays smooth.
- **Bring your own audio.** Components receive levels and values; they never open a microphone themselves. Use the included Web Audio hooks, or feed them from any other engine.
- **Real units.** Mixer components speak decibels, the way audio engineers do.

## Credits

audiocn is made by [fortysevenfx](https://x.com/fortysevenfx) and [orcdev](https://x.com/orcdev) and released under the MIT licence. This port keeps its design, its docs and its data attributes, so the [audiocn docs](https://audiocn.dev/docs) and this site describe the same components.
