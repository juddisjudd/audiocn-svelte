import { untrack } from "svelte";
import { extract, type MaybeGetter } from "runed";

import type { FrameSource } from "#lib/audio/types.js";

export interface UseFrameSourceOptions {
	/** Pause the subscription without unmounting. Default true. */
	enabled?: boolean;
}

/**
 * Subscribes `onFrame` to a frame source for the life of the calling component.
 * Call it during component setup. `onFrame` always sees current props, so it
 * never causes a resubscribe.
 */
export const useFrameSource = <T>(
	source: MaybeGetter<FrameSource<T> | null | undefined>,
	onFrame: (frame: T) => void,
	options: MaybeGetter<UseFrameSourceOptions> = {}
): void => {
	const current = $derived(extract(source));
	const enabled = $derived(extract(options).enabled ?? true);

	$effect(() => {
		if (!(current && enabled)) {
			return;
		}
		return current.subscribe((frame) => {
			untrack(() => onFrame(frame));
		});
	});
};
