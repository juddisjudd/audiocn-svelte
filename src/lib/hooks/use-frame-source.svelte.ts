import { untrack } from "svelte";
import { extract, type MaybeGetter } from "runed";

import type { FrameSource } from "#lib/audio/types.js";

export interface UseFrameSourceOptions {
	/** Pause the subscription without unmounting. Default true. */
	enabled?: MaybeGetter<boolean>;
}

/**
 * Subscribes `onFrame` to a frame source for the life of the calling component.
 * Call it during component setup. `onFrame` always sees current props, so it
 * never causes a resubscribe.
 */
export const useFrameSource = <T>(
	source: MaybeGetter<FrameSource<T> | null | undefined>,
	onFrame: (frame: T) => void,
	{ enabled = true }: UseFrameSourceOptions = {}
): void => {
	$effect(() => {
		const current = extract(source);
		if (!(current && extract(enabled))) {
			return;
		}
		return current.subscribe((frame) => {
			untrack(() => onFrame(frame));
		});
	});
};
