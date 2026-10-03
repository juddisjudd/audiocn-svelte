import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import BlocksTwice from "./blocks-twice.test.svelte";

describe("blocks rendered twice on one page", () => {
	it("keep every DOM id unique", () => {
		render(BlocksTwice, { props: { withSettings: true } });
		const ids = [...document.querySelectorAll("[id]")].map(({ id }) => id);
		expect(ids.length).toBeGreaterThan(0);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("toggle the switch of the instance whose label was clicked", async () => {
		render(BlocksTwice);
		const [, secondLabel] = screen.getAllByText("Mute microphone");
		const [first, second] = screen.getAllByRole("switch", {
			name: "Mute microphone",
		});
		await fireEvent.click(secondLabel as HTMLElement);
		expect(second).toHaveAttribute("aria-checked", "true");
		expect(first).toHaveAttribute("aria-checked", "false");
	});
});
