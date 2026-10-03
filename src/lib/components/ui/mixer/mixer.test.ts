import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import MixerEmpty from "./mixer-empty.test.svelte";
import MixerNavigation from "./mixer-navigation.test.svelte";

describe("Mixer", () => {
	it("shows the empty state without channels", () => {
		render(MixerEmpty);
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});

	it("moves focus to the same control on the next strip with Ctrl+arrow", async () => {
		render(MixerNavigation);
		const [first, second] = screen.getAllByRole("slider");
		first?.focus();
		await fireEvent.keyDown(first as HTMLElement, {
			ctrlKey: true,
			key: "ArrowRight",
		});
		expect(document.activeElement).toBe(second);
	});
});
