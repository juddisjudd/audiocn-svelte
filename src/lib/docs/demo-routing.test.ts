import { fireEvent, render, screen } from "@testing-library/svelte";
import type { Component } from "svelte";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import ChannelStripConsole from "./examples/channel-strip-console.svelte";
import ChannelStripDemo from "./examples/channel-strip-demo.svelte";
import FaderWithMeter from "./examples/fader-with-meter.svelte";
import MixerConsole from "./examples/mixer-console.svelte";
import MixerDemo from "./examples/mixer-demo.svelte";
import FadersTile from "./home/tiles/faders-tile.svelte";
import MixerTile from "./home/tiles/mixer-tile.svelte";
import { advance, useFakeFrames } from "#test/fake-frames.js";

beforeEach(useFakeFrames);
afterEach(() => vi.useRealTimers());

const level = (name: string) =>
	Number(screen.getByRole("meter", { name }).getAttribute("aria-valuenow"));

const expectCleared = (name: string) => {
	const meter = screen.getByRole("meter", { name });
	expect(level(name)).toBe(-60);
	const channels = meter.querySelectorAll<HTMLElement>("[data-slot='level-meter-channel']");
	expect(channels.length).toBeGreaterThan(0);
	for (const channel of channels) {
		for (const property of ["--meter-level", "--meter-rms", "--meter-hold"]) {
			const value = channel.style.getPropertyValue(property);
			expect(value).not.toBe("");
			expect(Number(value)).toBe(0);
		}
	}
};

it.each<{ Component: Component; meter: string; name: string }>([
	{ Component: ChannelStripDemo, meter: "Microphone level", name: "channel-strip-demo" },
	{ Component: ChannelStripConsole, meter: "Mic level", name: "channel-strip-console" },
	{ Component: MixerConsole, meter: "In 1 level", name: "mixer-console" },
	{ Component: MixerDemo, meter: "Microphone level", name: "mixer-demo" },
	{ Component: MixerTile, meter: "Microphone level", name: "mixer-tile" },
])("$name clears mute on the next frame", async ({ Component, meter }) => {
	const { unmount } = render(Component);
	advance(800);
	expect(level(meter)).toBeGreaterThan(-60);
	const [mute] = screen.getAllByRole("button", { name: /^Mute/u });
	await fireEvent.click(mute);
	advance(16);
	expectCleared(meter);
	await fireEvent.click(mute);
	advance(800);
	expect(level(meter)).toBeGreaterThan(-60);
	await fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "Home" });
	advance(16);
	// Ordinary fader changes still release smoothly after unmuting.
	expect(level(meter)).toBeGreaterThan(-60);
	unmount();
});

it.each([
	{ Component: MixerDemo, name: "mixer-demo" },
	{ Component: MixerTile, name: "mixer-tile" },
])("$name clears the master only when every input is muted", async ({ Component }) => {
	const { unmount } = render(Component);
	advance(800);
	const [first, ...others] = screen.getAllByRole("button", { name: /^Mute/u });
	await fireEvent.click(first);
	advance(16);
	expect(level("Master level")).toBeGreaterThan(-60);
	for (const mute of others) {
		await fireEvent.click(mute);
	}
	advance(16);
	expectCleared("Master level");
	await fireEvent.click(first);
	advance(800);
	expect(level("Master level")).toBeGreaterThan(-60);
	unmount();
});

it.each<{ Component: Component; fader: string; meter: string; name: string }>([
	{
		Component: FaderWithMeter,
		fader: "Program gain",
		meter: "Program level",
		name: "fader-with-meter",
	},
	{ Component: FadersTile, fader: "Drums volume", meter: "Drums level", name: "faders-tile" },
	{
		Component: ChannelStripDemo,
		fader: "Microphone volume",
		meter: "Microphone level",
		name: "channel-strip-demo",
	},
	{
		Component: ChannelStripConsole,
		fader: "Mic volume",
		meter: "Mic level",
		name: "channel-strip-console",
	},
	{ Component: MixerConsole, fader: "In 1 volume", meter: "In 1 level", name: "mixer-console" },
	{
		Component: MixerDemo,
		fader: "Microphone volume",
		meter: "Microphone level",
		name: "mixer-demo",
	},
	{
		Component: MixerTile,
		fader: "Microphone volume",
		meter: "Microphone level",
		name: "mixer-tile",
	},
])("$name routes $fader into $meter", async ({ Component, fader, meter }) => {
	const { unmount } = render(Component);
	advance(800);
	expect(level(meter)).toBeGreaterThan(-60);
	await fireEvent.keyDown(screen.getByRole("slider", { name: fader }), { key: "Home" });
	advance(4000);
	expect(level(meter)).toBeLessThanOrEqual(-60);
	await fireEvent.keyDown(screen.getByRole("slider", { name: fader }), { key: "End" });
	advance(800);
	expect(level(meter)).toBeGreaterThan(-60);
	unmount();
});

it.each([
	{ Component: MixerDemo, name: "mixer-demo" },
	{ Component: MixerTile, name: "mixer-tile" },
])("$name master follows channel faders and its own fader", async ({ Component }) => {
	const { unmount } = render(Component);
	advance(800);
	expect(level("Master level")).toBeGreaterThan(-60);
	for (const slider of screen.getAllByRole("slider")) {
		if (slider.getAttribute("aria-label") !== "Master volume") {
			await fireEvent.keyDown(slider, { key: "Home" });
		}
	}
	advance(4000);
	expect(level("Master level")).toBeLessThan(-48);
	await fireEvent.keyDown(screen.getByRole("slider", { name: "Microphone volume" }), {
		key: "End",
	});
	advance(800);
	expect(level("Master level")).toBeGreaterThan(-60);
	await fireEvent.keyDown(screen.getByRole("slider", { name: "Master volume" }), { key: "Home" });
	advance(4000);
	expect(level("Master level")).toBeLessThan(-48);
	expect(level("Microphone level")).toBeGreaterThan(-60);
	unmount();
});

it("console solo isolates channels, respects mute and restores the mix", async () => {
	const { unmount } = render(ChannelStripConsole);
	advance(800);
	await fireEvent.click(screen.getByRole("button", { name: "Solo Mic" }));
	advance(16);
	expect(level("Mic level")).toBeGreaterThan(-60);
	expectCleared("Music level");
	expectCleared("Game level");
	await fireEvent.click(screen.getByRole("button", { name: "Solo Music" }));
	advance(800);
	expect(level("Mic level")).toBeGreaterThan(-60);
	expect(level("Music level")).toBeGreaterThan(-60);
	expect(level("Game level")).toBe(-60);
	await fireEvent.click(screen.getByRole("button", { name: "Mute Mic" }));
	advance(16);
	expectCleared("Mic level");
	expect(level("Music level")).toBeGreaterThan(-60);
	await fireEvent.click(screen.getByRole("button", { name: "Solo Mic" }));
	await fireEvent.click(screen.getByRole("button", { name: "Solo Music" }));
	advance(800);
	expect(level("Mic level")).toBe(-60);
	expect(level("Music level")).toBeGreaterThan(-60);
	expect(level("Game level")).toBeGreaterThan(-60);
	unmount();
});
