import { clamp } from "#lib/audio/decibels.js";
import type { AudioPlayerController } from "#lib/hooks/use-audio-player.svelte.js";

export const DEFAULT_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
export const SEEK_STEP = 5;
export const SEEK_LARGE_STEP = 15;
const VOLUME_STEP = 0.05;

export const buttonClass =
	"inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 [&_svg:not([class*='size-'])]:size-4";

const isEditable = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

type ShortcutEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "target">;

const inSliderTarget = (target: HTMLElement) =>
	target.getAttribute("type") === "range" || target.getAttribute("role") === "slider";

/** The player action for a key, or null to let the key through. */
export const shortcutFor = (
	event: ShortcutEvent,
	player: AudioPlayerController
): (() => void) | null => {
	const target = event.target as HTMLElement;
	const seekAmount = event.shiftKey ? SEEK_LARGE_STEP : SEEK_STEP;
	const togglesPlayback = !(target.tagName === "BUTTON" || isEditable(target));
	const sliderKeys = !inSliderTarget(target);
	const actions: Record<string, (() => void) | null> = {
		" ": togglesPlayback ? () => player.toggle() : null,
		ArrowDown: sliderKeys ? () => player.setVolume(clamp(player.volume - VOLUME_STEP, 0, 1)) : null,
		ArrowLeft: sliderKeys ? () => player.seek(player.currentTime - seekAmount) : null,
		ArrowRight: sliderKeys ? () => player.seek(player.currentTime + seekAmount) : null,
		ArrowUp: sliderKeys ? () => player.setVolume(clamp(player.volume + VOLUME_STEP, 0, 1)) : null,
		End: () => player.seek(player.duration),
		Home: () => player.seek(0),
		k: togglesPlayback ? () => player.toggle() : null,
		m: () => player.setMuted(!player.muted),
	};
	return actions[event.key] ?? null;
};

export const POSITION_STEP = 0.0005;
const POSITION_DECIMALS = 4;

/**
 * A position on bits-ui's step grid, so the slider never snaps it and reports
 * a change nobody made.
 */
export const snapPosition = (position: number) => {
	const index = Math.round(clamp(position, 0, 1) / POSITION_STEP);
	const factor = 10 ** POSITION_DECIMALS;
	return Math.round(index * POSITION_STEP * factor) / factor;
};

/** Where a pointer is along a track, 0..1, or null when the track has no size. */
export const pointerPosition = (event: PointerEvent, track: HTMLElement | null): number | null => {
	const rect = track?.getBoundingClientRect();
	if (!(rect && rect.width > 0)) {
		return null;
	}
	return clamp((event.clientX - rect.left) / rect.width, 0, 1);
};
