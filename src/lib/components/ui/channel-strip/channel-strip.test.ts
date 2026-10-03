import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import StripWithChild from "./channel-strip-child.test.svelte";
import StripWithLevelMeter from "./channel-strip-level-meter.test.svelte";
import Strip from "./channel-strip.test.svelte";

describe("ChannelStrip", () => {
	it("is a named group that passes its orientation down", () => {
		render(StripWithLevelMeter);
		const strip = screen.getByRole("group", { name: "Mic" });
		expect(strip).toHaveAttribute("data-muted");
		const meter = screen.getByRole("meter");
		expect(meter).toHaveAttribute("data-orientation", "vertical");
		expect(meter).toHaveAttribute("data-dimmed");
	});

	it("lays its parts out on an inner grid and keeps console strips from shrinking", () => {
		const { rerender } = render(Strip, { props: { title: "Mic" } });
		const strip = screen.getByRole("group", { name: "Mic" });
		const layout = strip.querySelector('[data-slot="channel-strip-layout"]');
		expect(layout).toContainElement(screen.getByText("Mic"));
		expect(strip.className).toContain("@container/channel-strip");
		rerender({ orientation: "vertical", title: "Mic" });
		expect(screen.getByRole("group", { name: "Mic" })).toHaveClass("shrink-0");
	});

	it("reserves a fader row only when the strip has a fader", () => {
		render(Strip, { props: { title: "Mic" } });
		const layout = screen
			.getByRole("group", { name: "Mic" })
			.querySelector('[data-slot="channel-strip-layout"]');
		const classes = layout?.className.split(" ") ?? [];
		// Without a fader, the stacked and the wide layout are one meter row.
		expect(classes).toContain("[grid-template-areas:'header_header_header'_'meter_value_controls']");
		expect(classes).toContain(
			"@xl/channel-strip:[grid-template-areas:'header_meter_value_controls']"
		);
		const faderRows = classes.filter((name) => name.includes("fader_value"));
		expect(faderRows).toHaveLength(4);
		for (const name of faderRows) {
			expect(name).toContain("has-[>[data-slot=channel-strip-fader]]");
		}
	});

	it("exposes its state to custom parts", () => {
		render(Strip, { props: { probe: true, solo: true } });
		expect(screen.getByText("soloed")).toBeInTheDocument();
	});

	it("clears data-clipping when a clipping meter is removed", async () => {
		const { container, rerender } = render(Strip, { props: { withMeter: true } });
		const root = container.querySelector("[data-slot='channel-strip']");
		await waitFor(() => {
			expect(root).toHaveAttribute("data-clipping");
		});
		rerender({ withMeter: false });
		await waitFor(() => {
			expect(root).not.toHaveAttribute("data-clipping");
		});
	});

	it("renders its own root element through child", () => {
		const { component } = render(StripWithChild);
		const strip = screen.getByRole("group", { name: "Mic" });
		expect(strip.tagName).toBe("SECTION");
		expect(strip).toHaveAttribute("data-muted");
		expect(strip).toHaveAttribute("data-slot", "channel-strip");
		expect(strip.firstElementChild).toHaveAttribute("data-slot", "channel-strip-layout");
		expect(component.getRef()).toBe(strip);
	});
});
