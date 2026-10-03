import type { Component } from "svelte";

/**
 * The home page tiles, by name. A tile is `tiles/<name>-tile.svelte`; until
 * that file exists, the grid shows a placeholder of the same height.
 */
export const TILES = {
	channel: { label: "Channel controls", href: "/docs/components/channel-toggle", height: "h-34" },
	"compact-player": {
		label: "Audio player",
		href: "/docs/components/audio-player",
		height: "h-10",
	},
	eq: { label: "Parameter sliders", href: "/docs/components/parameter-slider", height: "h-46" },
	faders: { label: "Faders", href: "/docs/components/fader", height: "h-62" },
	knobs: { label: "Knobs", href: "/docs/components/knob", height: "h-23" },
	"live-waveform": {
		label: "Live waveform",
		href: "/docs/components/live-waveform",
		height: "h-31",
	},
	meters: { label: "Level meters", href: "/docs/components/level-meter", height: "h-62" },
	mixer: { label: "Mixer", href: "/docs/components/mixer", height: "h-75" },
	music: { label: "Music player", href: "/docs/blocks/music-player", height: "h-82 @lg:h-40" },
	output: { label: "Output", href: "/docs/components/audio-device-select", height: "h-19" },
	"sound-pads": {
		label: "Sound pads",
		href: "/docs/components/sound-pad",
		height: "h-76 @sm:h-50",
	},
	spectrum: { label: "Spectrum", href: "/docs/components/spectrum", height: "h-32" },
	voice: { label: "Bar visualizer", href: "/docs/components/bar-visualizer", height: "h-40" },
	waveform: { label: "Waveform", href: "/docs/components/waveform", height: "h-36" },
} as const;

export type TileName = keyof typeof TILES;

/** Three stacks: the wide one first, so phones show the mixer under the hero. */
export const GRID: { wide: TileName[]; left: TileName[]; right: TileName[] } = {
	wide: ["mixer", "waveform", "music", "sound-pads"],
	left: ["voice", "knobs", "spectrum", "eq", "live-waveform"],
	right: ["meters", "channel", "faders", "output", "compact-player"],
};

const modules = import.meta.glob<{ default: Component }>("./tiles/*-tile.svelte");

/** Loads a tile, or returns undefined while its file does not exist. */
export const loadTile = (name: TileName) => modules[`./tiles/${name}-tile.svelte`]?.();

export const hasTile = (name: TileName) => `./tiles/${name}-tile.svelte` in modules;
