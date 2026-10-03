import { render } from "@testing-library/svelte";
import type { Component } from "svelte";
import { describe, expect, it } from "vitest";

const modules = {
	...import.meta.glob<{ default: Component }>("./examples/*.svelte", { eager: true }),
	...import.meta.glob<{ default: Component }>("./home/tiles/*.svelte", { eager: true }),
};

const entries = Object.entries(modules).map(
	([path, module]) => [path.replace(/^\.\//, "").replace(/\.svelte$/, ""), module] as const
);

describe("docs examples and home tiles", () => {
	it.each(entries)("%s renders", (_name, module) => {
		const { container } = render(module.default);
		expect(container.childElementCount).toBeGreaterThan(0);
	});
});
