import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import type { AudioPlayerController } from "#lib/hooks/use-audio-player.svelte.js";

import Harness from "./audio-player.test.svelte";
import { AudioPlayer, AudioPlayerArtwork } from "./index.js";

const controller = (overrides: Partial<AudioPlayerController> = {}): AudioPlayerController => ({
	buffered: 0,
	currentTime: 84,
	duration: 220,
	element: null,
	error: null,
	loop: false,
	muted: false,
	pause: vi.fn(),
	play: vi.fn(async () => {}),
	playbackRate: 1,
	playing: false,
	seek: vi.fn(),
	setLoop: vi.fn(),
	setMuted: vi.fn(),
	setPlaybackRate: vi.fn(),
	setVolume: vi.fn(),
	status: "paused",
	time: { subscribe: () => () => {} },
	toggle: vi.fn(async () => {}),
	volume: 1,
	...overrides,
});

describe("AudioPlayer", () => {
	it("distinguishes meaningful artwork from decorative artwork", async () => {
		const { rerender } = render(AudioPlayerArtwork, {
			props: { alt: "Night Drive album cover", src: "/cover.png" },
		});
		expect(screen.getByRole("img", { name: "Night Drive album cover" })).toBeInTheDocument();
		await rerender({ alt: undefined, src: "/cover.png" });
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
		expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
	});

	it("renders parts bound to an external player", async () => {
		const player = controller();
		render(Harness, { props: { player } });
		await fireEvent.click(screen.getByRole("button", { name: "Play" }));
		expect(player.toggle).toHaveBeenCalled();
		expect(screen.getByText("1:24")).toBeInTheDocument();
		expect(screen.getByText("−2:16")).toBeInTheDocument();
	});

	it("handles keyboard shortcuts", async () => {
		const player = controller();
		render(Harness, { props: { parts: "focus-target", player } });
		const target = screen.getByText("focus target");
		await fireEvent.keyDown(target, { key: "ArrowRight" });
		expect(player.seek).toHaveBeenCalledWith(89);
		await fireEvent.keyDown(target, { key: "m" });
		expect(player.setMuted).toHaveBeenCalledWith(true);
		await fireEvent.keyDown(target, { key: "k" });
		expect(player.toggle).toHaveBeenCalled();
	});
});

describe("controls", () => {
	it("audio player: reports time changes, not parent re-renders", async () => {
		const player = controller({ currentTime: 12 });
		const reported: number[] = [];
		const { rerender } = render(AudioPlayer, {
			props: {
				"aria-label": "Player",
				onTimeUpdate: (time: number) => reported.push(time),
				player,
			},
		});
		const calls = reported.length;
		await rerender({ "aria-label": "Player, again" });
		expect(reported).toHaveLength(calls);
	});
});
