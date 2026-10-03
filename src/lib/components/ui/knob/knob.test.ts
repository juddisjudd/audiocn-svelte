import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import { Knob, parseKnobValue } from "./index.js";
import KnobHarness from "./knob.test.svelte";
import PanControlKnob from "./pan-control-knob.test.svelte";

/** The shared AudioContext the knob clicks through, null like on the server. */
const audio = vi.hoisted(() => ({ context: null as unknown }));

vi.mock("#lib/hooks/use-audio-context.svelte.js", async (importOriginal) => ({
	...(await importOriginal<typeof import("#lib/hooks/use-audio-context.svelte.js")>()),
	getSharedAudioContext: () => audio.context as AudioContext | null,
}));

/** A fake audio node that chains and cleans up like a real one. */
const fakeNode = () => ({
	addEventListener: vi.fn(),
	connect: (next: unknown) => next,
	disconnect: vi.fn(),
});

/** The knob's dial, laid out as a 100px square at the page origin. */
const circularDial = () => {
	const dial = screen.getByRole("slider");
	dial.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
	dial.setPointerCapture = vi.fn();
	dial.hasPointerCapture = vi.fn(() => true);
	dial.releasePointerCapture = vi.fn();
	return dial;
};

describe("Knob", () => {
	it("is a slider that responds to the keyboard and double-click", async () => {
		const onValueChange = vi.fn();
		render(Knob, { "aria-label": "Gain", onValueChange, value: 50 });
		const dial = screen.getByRole("slider");
		expect(dial).toHaveAttribute("aria-valuenow", "50");
		await fireEvent.keyDown(dial, { key: "ArrowUp", shiftKey: true });
		expect(onValueChange).toHaveBeenLastCalledWith(60, expect.anything());
		await fireEvent.doubleClick(dial);
		expect(onValueChange).toHaveBeenLastCalledWith(50, expect.anything());
	});

	it("keeps its angle when given a style", () => {
		render(KnobHarness, {
			"aria-label": "Gain",
			dialStyle: "--from-test: 1",
			layout: "style",
			value: 50,
		});
		const dial = screen.getByRole("slider");
		expect(dial.style.getPropertyValue("--knob-angle")).not.toBe("");
		expect(dial.style.getPropertyValue("--from-test")).toBe("1");
	});

	it("resets on Alt+click", async () => {
		const onValueChange = vi.fn();
		render(Knob, { "aria-label": "Gain", onValueChange, value: 50 });
		const dial = screen.getByRole("slider");
		await fireEvent.keyDown(dial, { key: "ArrowUp" });
		await fireEvent.pointerDown(dial, { altKey: true, button: 0 });
		expect(onValueChange).toHaveBeenLastCalledWith(50, { reason: "reset" });
	});

	it("drags ten times finer with Shift, without jumping when Shift changes", async () => {
		const onValueChange = vi.fn();
		render(Knob, { "aria-label": "Gain", onValueChange, value: 50 });
		const dial = screen.getByRole("slider");
		dial.setPointerCapture = vi.fn();
		dial.hasPointerCapture = vi.fn(() => true);
		dial.releasePointerCapture = vi.fn();
		await fireEvent.pointerDown(dial, { button: 0, clientY: 100 });
		// 20px up is a tenth of the 200px sensitivity: 10 units, or 1 with Shift.
		await fireEvent.pointerMove(dial, { clientY: 80, shiftKey: true });
		expect(onValueChange).toHaveBeenLastCalledWith(51, expect.anything());
		await fireEvent.pointerMove(dial, { clientY: 60 });
		expect(onValueChange).toHaveBeenLastCalledWith(61, expect.anything());
	});

	it("turns from where it is grabbed when circled, and stops at its ends", async () => {
		const onValueChange = vi.fn();
		render(Knob, {
			"aria-label": "Gain",
			dragDirection: "circular",
			onValueChange,
			value: 50,
		});
		const dial = circularDial();
		// Grabbed at 3 o'clock, a quarter turn is a third of the 270° arc.
		await fireEvent.pointerDown(dial, { button: 0, clientX: 90, clientY: 50 });
		await fireEvent.pointerMove(dial, { clientX: 50, clientY: 90 });
		expect(onValueChange).toHaveBeenLastCalledWith(83, expect.anything());
		// Past the end, across the gap at the bottom, it stays at the end.
		await fireEvent.pointerMove(dial, { clientX: 10, clientY: 50 });
		expect(onValueChange).toHaveBeenLastCalledWith(100, expect.anything());
		// Turning back moves it straight away.
		await fireEvent.pointerMove(dial, { clientX: 50, clientY: 90 });
		expect(onValueChange).toHaveBeenLastCalledWith(67, expect.anything());
	});

	it("ignores the pointer near the centre of the dial while circling", async () => {
		const onValueChange = vi.fn();
		render(Knob, {
			"aria-label": "Gain",
			dragDirection: "circular",
			onValueChange,
			value: 50,
		});
		const dial = circularDial();
		await fireEvent.pointerDown(dial, { button: 0, clientX: 90, clientY: 50 });
		await fireEvent.pointerMove(dial, { clientX: 48, clientY: 52 });
		// Leaving the centre picks up from there, without a jump.
		await fireEvent.pointerMove(dial, { clientX: 50, clientY: 10 });
		expect(onValueChange).not.toHaveBeenCalled();
		await fireEvent.pointerMove(dial, { clientX: 90, clientY: 50 });
		expect(onValueChange).toHaveBeenLastCalledWith(83, expect.anything());
	});

	it("edits the value on double-click and returns focus to the dial", async () => {
		const onValueCommit = vi.fn();
		render(KnobHarness, { layout: "value", onValueCommit, value: 50 });
		await fireEvent.doubleClick(screen.getByText("50"));
		const input = screen.getByRole("textbox", { name: "Value" });
		await fireEvent.input(input, { target: { value: "72" } });
		await fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueCommit).toHaveBeenLastCalledWith(72);
		expect(screen.getByText("72")).toBeInTheDocument();
		expect(screen.getByRole("slider")).toHaveFocus();
	});

	it("opens the editor from the label or Enter, and Escape cancels", async () => {
		const onValueCommit = vi.fn();
		render(KnobHarness, { layout: "value", onValueCommit, value: 50 });
		await fireEvent.doubleClick(screen.getByText("Gain"));
		const input = screen.getByRole("textbox", { name: "Value" });
		await fireEvent.input(input, { target: { value: "10" } });
		await fireEvent.keyDown(input, { key: "Escape" });
		expect(onValueCommit).not.toHaveBeenCalled();
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "Enter" });
		expect(screen.getByRole("textbox", { name: "Value" })).toHaveValue("50");
	});

	it("draws a numbered scale, lit from the origin to the value", async () => {
		const { container } = render(KnobHarness, {
			"aria-label": "Volume",
			layout: "scale",
			scaleProps: { labelEvery: 10, majorEvery: 5, ticks: 100 },
			value: 33,
		});
		const ticks = container.querySelectorAll("[data-slot='knob-tick']");
		const labels = container.querySelectorAll("[data-slot='knob-scale-label']");
		expect(ticks).toHaveLength(101);
		expect(container.querySelectorAll("[data-major]")).toHaveLength(21);
		expect([...labels].map((label) => label.textContent)).toEqual([
			"0",
			"10",
			"20",
			"30",
			"40",
			"50",
			"60",
			"70",
			"80",
			"90",
			"100",
		]);
		expect(container.querySelectorAll("[data-active]")).toHaveLength(34);
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
		expect(container.querySelectorAll("[data-active]")).toHaveLength(101);
	});

	it("lights a bipolar scale from its centre", () => {
		const { container } = render(KnobHarness, {
			"aria-label": "Gain",
			layout: "scale",
			max: 24,
			min: -24,
			origin: 0,
			scaleProps: { labelEvery: 0, ticks: 48 },
			value: -12,
		});
		const lit = [...container.querySelectorAll<SVGLineElement>("[data-slot='knob-tick']")]
			.map((tick, index) => (Object.hasOwn(tick.dataset, "active") ? index : null))
			.filter((index) => index !== null);
		// -12 dB to 0 dB is ticks 12 to 24 of 48.
		expect(lit).toEqual(Array.from({ length: 13 }, (_, index) => index + 12));
		expect(container.querySelectorAll("[data-slot='knob-scale-label']")).toHaveLength(0);
	});

	it("turns the cap's grain with the dot while keeping the lighting fixed", async () => {
		const { container } = render(KnobHarness, {
			"aria-label": "Volume",
			layout: "cap",
			value: 50,
		});
		const dot = () => container.querySelector("[data-slot='knob-cap-dot']");
		const grain = container.querySelector("[data-slot='knob-cap-grain']");
		const face = container.querySelector("[data-slot='knob-cap-face']");
		const faceMarkup = face?.outerHTML;
		expect(grain).toHaveAttribute("transform", "rotate(0 50 50)");
		// At the middle of the arc the dot is straight up.
		expect(Number(dot()?.getAttribute("cx"))).toBeCloseTo(50);
		expect(Number(dot()?.getAttribute("cy"))).toBeLessThan(50);
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
		expect(Number(dot()?.getAttribute("cx"))).toBeGreaterThan(50);
		expect(Number(dot()?.getAttribute("cy"))).toBeGreaterThan(50);
		expect(grain).toHaveAttribute("transform", "rotate(135 50 50)");
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
		expect(grain).toHaveAttribute("transform", "rotate(-135 50 50)");
		expect(face?.outerHTML).toBe(faceMarkup);
	});

	it("marks the mini cap with an engraved line that turns with the value", async () => {
		const { container } = render(KnobHarness, {
			"aria-label": "Gain",
			capProps: { variant: "mini" },
			layout: "cap",
			value: 50,
		});
		const cap = container.querySelector("[data-slot='knob-cap']");
		const pointer = () => container.querySelector("[data-slot='knob-cap-pointer']");
		const end = (axis: "x" | "y") => Number(pointer()?.getAttribute(`${axis}2`));
		expect(cap).toHaveAttribute("data-variant", "mini");
		expect(container.querySelector("[data-slot='knob-cap-dot']")).toBeNull();
		// At the middle of the arc the line points straight up.
		expect(end("x")).toBeCloseTo(50);
		expect(end("y")).toBeLessThan(50);
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
		expect(end("x")).toBeGreaterThan(50);
		expect(end("y")).toBeGreaterThan(50);
		await fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
		expect(end("x")).toBeLessThan(50);
		expect(end("y")).toBeGreaterThan(50);
	});

	it("clicks on graduations only with clickSound", async () => {
		const start = vi.fn();
		const fakeContext = {
			createBuffer: (_channels: number, length: number) => ({
				getChannelData: () => new Float32Array(length),
			}),
			createBufferSource: () => ({
				...fakeNode(),
				buffer: null,
				playbackRate: { value: 1 },
				start,
			}),
			createGain: () => ({ ...fakeNode(), gain: { value: 1 } }),
			currentTime: 0,
			destination: {},
			sampleRate: 48_000,
			state: "running",
		};
		audio.context = fakeContext;
		// Far enough apart that no click is held back by the 30 ms limit.
		let now = 0;
		vi.spyOn(performance, "now").mockImplementation(() => {
			now += 100;
			return now;
		});
		try {
			const { unmount } = render(Knob, { "aria-label": "Quiet", value: 50 });
			await fireEvent.keyDown(screen.getByRole("slider"), { key: "PageUp" });
			expect(start).not.toHaveBeenCalled();
			unmount();

			// Without a scale it clicks every largeStep: 59 is silent, 60 clicks.
			const { unmount: unmountPlain } = render(Knob, {
				"aria-label": "Volume",
				clickSound: true,
				value: 58,
			});
			const plain = screen.getByRole("slider");
			await fireEvent.keyDown(plain, { key: "ArrowUp" });
			expect(start).not.toHaveBeenCalled();
			await fireEvent.keyDown(plain, { key: "ArrowUp" });
			expect(start).toHaveBeenCalledTimes(1);
			// Leaving a graduation is silent; reaching the one below clicks.
			await fireEvent.keyDown(plain, { key: "ArrowDown" });
			expect(start).toHaveBeenCalledTimes(1);
			await fireEvent.keyDown(plain, { key: "PageDown" });
			expect(start).toHaveBeenCalledTimes(2);
			unmountPlain();

			// With a scale it clicks on the long ticks, every 5 here.
			render(KnobHarness, {
				"aria-label": "Volume",
				clickSound: true,
				layout: "scale",
				scaleProps: { majorEvery: 5, ticks: 100 },
				value: 33,
			});
			const dial = screen.getByRole("slider");
			await fireEvent.keyDown(dial, { key: "ArrowUp" });
			expect(start).toHaveBeenCalledTimes(2);
			await fireEvent.keyDown(dial, { key: "ArrowUp" });
			expect(start).toHaveBeenCalledTimes(3);
		} finally {
			audio.context = null;
			vi.restoreAllMocks();
		}
	});

	it("reads typed values", () => {
		expect(parseKnobValue("−12 dB")).toBe(-12);
		expect(parseKnobValue("1.2k")).toBe(1200);
		expect(parseKnobValue("gain")).toBeNull();
	});
});

describe("controls", () => {
	it("knob: the wheel doesn't change a disabled dial", async () => {
		render(Knob, { allowWheel: true, "aria-label": "Gain", disabled: true, value: 50 });
		const dial = screen.getByRole("slider");
		dial.focus();
		await fireEvent.wheel(dial, { deltaY: -100 });
		expect(dial).toHaveAttribute("aria-valuenow", "50");
	});

	it("knob: the wheel still turns an enabled dial", async () => {
		render(Knob, { allowWheel: true, "aria-label": "Gain", value: 50 });
		const dial = screen.getByRole("slider");
		dial.focus();
		await fireEvent.wheel(dial, { deltaY: -100 });
		expect(dial).not.toHaveAttribute("aria-valuenow", "50");
	});
});

describe("PanControlKnob", () => {
	it("names the dial and describes its range and centre", () => {
		render(PanControlKnob);
		const dial = screen.getByRole("slider", { name: "Pan" });
		expect(dial).toHaveAttribute("tabindex", "0");
		expect(dial).toHaveAttribute("aria-valuemin", "-1");
		expect(dial).toHaveAttribute("aria-valuemax", "1");
		expect(dial).toHaveAttribute("aria-valuenow", "0");
		expect(dial).toHaveAttribute("aria-valuetext", "Center");
		expect(screen.getByText("C")).toBeInTheDocument();
	});

	it("describes keyboard changes in words and resets to centre", async () => {
		render(PanControlKnob);
		const dial = screen.getByRole("slider", { name: "Pan" });
		await fireEvent.keyDown(dial, { key: "ArrowLeft" });
		expect(dial).toHaveAttribute("aria-valuetext", "5% left");
		await fireEvent.keyDown(dial, { key: "PageDown" });
		expect(dial).toHaveAttribute("aria-valuetext", "30% left");
		expect(screen.getByText("L30")).toBeInTheDocument();
		await fireEvent.keyDown(dial, { key: "PageUp" });
		expect(dial).toHaveAttribute("aria-valuetext", "5% left");
		await fireEvent.keyDown(dial, { key: "ArrowRight", shiftKey: true });
		expect(dial).toHaveAttribute("aria-valuetext", "20% right");
		await fireEvent.keyDown(dial, { key: "Home" });
		expect(dial).toHaveAttribute("aria-valuenow", "-1");
		expect(dial).toHaveAttribute("aria-valuetext", "100% left");
		await fireEvent.keyDown(dial, { key: "End" });
		expect(dial).toHaveAttribute("aria-valuenow", "1");
		expect(dial).toHaveAttribute("aria-valuetext", "100% right");
		await fireEvent.doubleClick(dial);
		expect(dial).toHaveAttribute("aria-valuetext", "Center");
	});

	it("supports value entry by keyboard and restores focus", async () => {
		render(PanControlKnob);
		const dial = screen.getByRole("slider", { name: "Pan" });
		await fireEvent.keyDown(dial, { key: "Enter" });
		const input = screen.getByRole("textbox", { name: "Value" });
		expect(input).toHaveFocus();
		await fireEvent.input(input, { target: { value: "L30" } });
		await fireEvent.keyDown(input, { key: "Enter" });
		expect(dial).toHaveAttribute("aria-valuenow", "-0.3");
		expect(dial).toHaveAttribute("aria-valuetext", "30% left");
		expect(dial).toHaveFocus();

		await fireEvent.keyDown(dial, { key: "Enter" });
		const editor = screen.getByRole("textbox", { name: "Value" });
		await fireEvent.input(editor, { target: { value: "R30" } });
		await fireEvent.keyDown(editor, { key: "Escape" });
		expect(dial).toHaveAttribute("aria-valuenow", "-0.3");
		expect(dial).toHaveFocus();
	});

	it("removes the disabled dial from the tab order and blocks input", async () => {
		render(PanControlKnob, { disabled: true });
		const dial = screen.getByRole("slider", { name: "Pan" });
		expect(dial).toHaveAttribute("aria-disabled", "true");
		expect(dial).toHaveAttribute("tabindex", "-1");
		await fireEvent.keyDown(dial, { key: "ArrowRight" });
		await fireEvent.keyDown(dial, { key: "Enter" });
		expect(dial).toHaveAttribute("aria-valuenow", "0");
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});
});
