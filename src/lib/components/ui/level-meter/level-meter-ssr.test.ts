// @vitest-environment node
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import { LevelMeter } from "./index.js";

describe("meters across re-renders", () => {
	it("renders its zone fill on the server", () => {
		const { body } = render(LevelMeter, { props: { "aria-label": "Mic", peakDb: -12 } });
		expect(body).toMatch(/--meter-fill:\s*linear-gradient/);
		expect(body).toContain('role="meter"');
	});
});
