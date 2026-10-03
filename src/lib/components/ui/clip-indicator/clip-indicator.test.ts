import { fireEvent, render, screen } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { advance, useFakeFrames } from "#test/fake-frames.js";
import { ClipIndicator } from "./index.js";

beforeEach(() => {
	useFakeFrames();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("ClipIndicator", () => {
	it("lights up on a clip, counts it and resets on click", async () => {
		const { component } = render(ClipIndicator, { props: { showCount: true } });
		const button = screen.getByRole("button");
		expect(button).not.toHaveAttribute("data-clipping");

		component.report(0);
		flushSync();
		advance(10);
		expect(button).toHaveAttribute("data-clipping");
		expect(button).toHaveTextContent("1");

		await fireEvent.click(button);
		expect(button).not.toHaveAttribute("data-clipping");
		expect(button).toHaveTextContent("0");
	});

	it("turns off after the hold time", () => {
		const { component } = render(ClipIndicator, { props: { holdMs: 500 } });
		component.report(-0.5);
		flushSync();
		advance(10);
		expect(screen.getByRole("button")).toHaveAttribute("data-clipping");
		advance(600);
		expect(screen.getByRole("button")).not.toHaveAttribute("data-clipping");
	});

	it("runs your onclick before the reset, and preventDefault keeps the light on", async () => {
		const seen: boolean[] = [];
		const { component } = render(ClipIndicator, {
			props: {
				holdMs: Infinity,
				onclick: (event: MouseEvent) => {
					const button = event.currentTarget as HTMLElement;
					seen.push(button.hasAttribute("data-clipping"));
					event.preventDefault();
				},
			},
		});
		component.report(0);
		flushSync();
		await fireEvent.click(screen.getByRole("button"));
		expect(seen).toEqual([true]);
		expect(screen.getByRole("button")).toHaveAttribute("data-clipping");
	});

	it("follows the controlled prop", () => {
		render(ClipIndicator, { props: { clipping: true } });
		expect(screen.getByRole("button")).toHaveAttribute("data-clipping");
	});
});
