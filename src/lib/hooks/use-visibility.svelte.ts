import { extract, type MaybeGetter } from "runed";

export interface Visibility {
	/** Whether the element is on screen. Reading it never triggers an update. */
	readonly current: boolean;
}

/**
 * Tracks whether an element is on screen, so a painter can skip frames nobody
 * can see. `onChange` runs when the element comes into or leaves view, so a
 * painter that slept while hidden can wake up. Call it during component setup.
 */
export const useVisibility = (
	target: MaybeGetter<Element | null | undefined>,
	onChange?: (visible: boolean) => void
): Visibility => {
	let visible = true;

	$effect(() => {
		const element = extract(target);
		if (!element || typeof IntersectionObserver === "undefined") {
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting !== visible) {
					visible = entry.isIntersecting;
					onChange?.(entry.isIntersecting);
				}
			}
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	});

	return {
		get current() {
			return visible;
		},
	};
};
