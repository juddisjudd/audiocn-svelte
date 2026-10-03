import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import TracksWithChild from "./track-list-child.test.svelte";
import Tracks from "./track-list.test.svelte";

describe("TrackList", () => {
	it("selects with Enter and moves with the arrow keys", async () => {
		const onSelect = vi.fn();
		render(Tracks, { props: { onSelect } });
		const [first, second] = screen.getAllByRole("listitem");
		expect(first).toHaveAttribute("aria-current", "true");
		first?.focus();
		await fireEvent.keyDown(first as HTMLElement, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledTimes(1);
		await fireEvent.keyDown(first as HTMLElement, { key: "ArrowDown" });
		expect(document.activeElement).toBe(second);
	});

	it("renders its own item element through child", async () => {
		const onSelect = vi.fn();
		render(TracksWithChild, { props: { onSelect } });
		const item = screen.getByRole("listitem");
		expect(item).toHaveAttribute("data-custom");
		expect(item).toHaveAttribute("data-active");
		expect(item).toHaveAttribute("tabindex", "0");
		await fireEvent.click(item);
		expect(onSelect).toHaveBeenCalledTimes(1);
	});
});
