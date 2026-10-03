// @vitest-environment node
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import { SoundPadProgress } from "./index.js";

describe("controls", () => {
	it("sound pad progress: renders a declarative value on the server", () => {
		const { body } = render(SoundPadProgress, { props: { value: 0.5 } });
		expect(body).toContain("--pad-progress:0.5000");
	});
});
