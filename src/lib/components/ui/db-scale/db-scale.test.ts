import { render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFakeFrames } from "#test/fake-frames.js";
import { DbScale, thinDbScaleLabels } from "./index.js";

beforeEach(() => {
	useFakeFrames();
});

afterEach(() => {
	vi.useRealTimers();
});

/** Places each label along the scale, as layout would. */
const placeLabels = (scale: HTMLElement, spans: Record<string, [number, number]>) => {
	for (const tick of scale.querySelectorAll<HTMLElement>('[data-slot="db-scale-tick"]')) {
		const [left, right] = spans[tick.dataset.value ?? ""] ?? [0, 0];
		const label = tick.querySelector<HTMLElement>('[data-slot="db-scale-label"]');
		if (label) {
			label.getBoundingClientRect = () =>
				DOMRect.fromRect({ height: 10, width: right - left, x: left, y: 0 });
		}
	}
};

describe("DbScale", () => {
	it("renders common ticks inside the range", () => {
		const { container } = render(DbScale, { props: { maxDb: 0, minDb: -24 } });
		const labels = [...container.querySelectorAll('[data-slot="db-scale-label"]')].map(
			(label) => label.textContent
		);
		expect(labels).toEqual(["0", "−6", "−12", "−18", "−24"]);
	});

	it("hides labels that would touch 0 dB or the ends", () => {
		const { container } = render(DbScale, { props: { ticks: [0, -6, -12, -54, -60] } });
		const scale = container.querySelector<HTMLElement>('[data-slot="db-scale"]');
		if (!scale) {
			throw new Error("No scale rendered.");
		}
		placeLabels(scale, {
			"-12": [70, 80],
			"-54": [8, 18],
			"-6": [92, 102],
			"-60": [0, 10],
			"0": [100, 110],
		});
		thinDbScaleLabels(scale);
		const hidden = [...scale.querySelectorAll('[data-slot="db-scale-label"][data-hidden]')].map(
			(label) => label.textContent
		);
		expect(hidden).toEqual(["−6", "−54"]);
	});

	it("renders custom ticks", () => {
		const { container } = render(DbScale, { props: { ticks: [-3, -9] } });
		expect(container.querySelectorAll('[data-slot="db-scale-tick"]')).toHaveLength(2);
	});
});
