import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";

import { MuteToggle } from "./index.js";

describe("MuteToggle", () => {
	it("toggles its pressed state", async () => {
		const onPressedChange = vi.fn();
		render(MuteToggle, {
			children: createRawSnippet(() => ({ render: () => "<span>M</span>" })),
			onPressedChange,
		});
		const toggle = screen.getByRole("button", { name: "Mute" });
		await fireEvent.click(toggle);
		expect(onPressedChange).toHaveBeenCalledWith(true);
		expect(toggle).toHaveAttribute("aria-pressed", "true");
	});
});
