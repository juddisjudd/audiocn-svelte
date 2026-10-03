import { render, screen } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFrameEmitter } from "#lib/audio/frame-source.js";
import type { MeterFrame } from "#lib/audio/types.js";
import { advance, useFakeFrames } from "#test/fake-frames.js";
import BusyParent from "./db-readout-busy-parent.test.svelte";
import { DbReadout } from "./index.js";

beforeEach(() => {
	useFakeFrames();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("DbReadout", () => {
	it("formats a declarative value", () => {
		render(DbReadout, { props: { value: -6 } });
		expect(screen.getByText("−6.0 dB")).toBeInTheDocument();
	});

	it("updates from a source at its interval", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		const { container } = render(DbReadout, { props: { source: emitter } });
		const readout = container.querySelector('[data-slot="db-readout"]');
		expect(readout).toHaveTextContent("−∞ dB");
		emitter.emit({ channels: [{ peakDb: -12.34 }] });
		advance(260);
		expect(readout).toHaveTextContent("−12.3 dB");
		expect(readout).toHaveAttribute("data-zone", "warn");
	});

	it("shows the value again when its source goes away", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		const { container, rerender } = render(DbReadout, { props: { source: emitter } });
		emitter.emit({ channels: [{ peakDb: -12.34 }] });
		advance(260);
		// The value renders the same text as the live readout's first paint, so
		// the template alone would leave the last live level on screen.
		rerender({ source: undefined, value: Number.NEGATIVE_INFINITY });
		const readout = container.querySelector('[data-slot="db-readout"]');
		expect(readout).toHaveTextContent("−∞ dB");
		expect(readout).toHaveAttribute("data-zone", "ok");
		expect(readout).toHaveAttribute("data-silent");
	});

	it("shows the live level again when a source comes back", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		const { container, rerender } = render(DbReadout, { props: { source: emitter } });
		emitter.emit({ channels: [{ peakDb: -12.34 }] });
		advance(260);
		rerender({ source: undefined, value: Number.NEGATIVE_INFINITY });
		rerender({ source: emitter, value: undefined });
		emitter.emit({ channels: [{ peakDb: -12.34 }] });
		advance(260);
		const readout = container.querySelector('[data-slot="db-readout"]');
		expect(readout).toHaveTextContent("−12.3 dB");
		expect(readout).toHaveAttribute("data-zone", "warn");
	});
});

describe("meters across re-renders", () => {
	it("keeps a readout updating while its parent re-renders faster than it ticks", () => {
		const emitter = createFrameEmitter<MeterFrame>();
		render(BusyParent, { props: { source: emitter } });
		emitter.emit({ channels: [{ peakDb: -6 }] });
		flushSync();
		// Small steps, so each parent update lands between timer ticks.
		for (let step = 0; step < 6; step += 1) {
			advance(50);
		}
		expect(document.querySelector("[data-slot='db-readout']")).toHaveTextContent("-6.0 dB");
	});
});

describe("settled painters request no frames", () => {
	it("dB readout: its ticker stops when the source goes quiet and restarts on a frame", () => {
		const source = createFrameEmitter<MeterFrame>();
		render(DbReadout, { props: { source } });
		const readout = document.querySelector("[data-slot='db-readout']");

		source.emit({ channels: [{ peakDb: -12 }] });
		flushSync();
		advance(300);
		expect(readout).toHaveTextContent("−12.0 dB");

		advance(2000);
		expect(readout).toHaveTextContent("−∞ dB");
		expect(vi.getTimerCount()).toBe(0);

		source.emit({ channels: [{ peakDb: -6 }] });
		flushSync();
		advance(300);
		expect(readout).toHaveTextContent("−6.0 dB");
	});
});
