import { flushSync } from "svelte";
import { vi } from "vitest";

/** Fake timers that also drive requestAnimationFrame and performance.now. */
export const useFakeFrames = () => {
	vi.useFakeTimers({
		toFake: [
			"setTimeout",
			"clearTimeout",
			"setInterval",
			"clearInterval",
			"requestAnimationFrame",
			"cancelAnimationFrame",
			"performance",
			"Date",
		],
	});
};

/** Advances fake time, running animation frames and timers, then flushes Svelte updates. */
export const advance = (ms: number) => {
	vi.advanceTimersByTime(ms);
	flushSync();
};
