import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";
import { docsPages } from "./routes";
import { mountShowcase } from "./showcase";

const pages = docsPages;

test("missing docs pages offer a way back to the documentation", async ({ page }) => {
	const response = await page.goto("/docs/does-not-exist");
	expect(response?.status()).toBe(404);
	await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
	await page.getByRole("link", { name: "Browse documentation" }).click();
	await expect(page.getByRole("heading", { exact: true, name: "Introduction" })).toBeVisible();
});

test.describe("every docs page", () => {
	for (const url of pages) {
		test(`renders ${url} and switches its previews to code and back`, async ({ page }) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			page.on("console", (message) => {
				if (message.type() === "error") {
					errors.push(message.text());
				}
			});
			const response = await page.goto(url);
			expect(response?.status()).toBe(200);
			await expect(page.locator("h1").first()).toBeVisible();
			await page.waitForTimeout(500);
			// Showing the code unmounts the preview, so its audio teardown runs.
			const codeTabs = page.getByRole("tab", { exact: true, name: "Code" });
			const previewTabs = page.getByRole("tab", {
				exact: true,
				name: "Preview",
			});
			const count = await codeTabs.count();
			// One preview at a time, in order.
			const toggleFrom = async (index: number): Promise<void> => {
				if (index >= count) {
					return;
				}
				await codeTabs.nth(index).click();
				await previewTabs.nth(index).click();
				await toggleFrom(index + 1);
			};
			await toggleFrom(0);
			await page.waitForTimeout(500);
			await expect(page.locator("h1").first()).toBeVisible();
			expect(errors).toEqual([]);
		});
	}
});

test("the home page shows a live mixer", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { level: 1 })).toContainText("mixed and mastered");
	await page.getByRole("article", { name: "Mixer" }).scrollIntoViewIfNeeded();
	const meter = page.getByRole("meter", { name: "Microphone level" });
	await expect(meter).toBeVisible();
	await expect
		.poll(async () => Number(await meter.getAttribute("aria-valuenow")), {
			timeout: 10_000,
		})
		.toBeGreaterThan(-60);
});

test("every home showcase tile loads without errors", async ({ page }) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error") {
			errors.push(message.text());
		}
	});
	await page.goto("/");
	await mountShowcase(page);
	await expect(page.getByRole("button", { name: "Airhorn" })).toBeVisible();
	await expect(
		page.getByRole("article", { name: "Music player" }).getByText("Night Drive").last()
	).toBeVisible();
	expect(errors).toEqual([]);
});

test("the home mixer solos a channel and dims the others", async ({ page }) => {
	await page.goto("/");
	const mixer = page.getByRole("group", { name: "Mixer" });
	await mixer.getByRole("button", { name: "Solo Microphone" }).click();
	await expect(mixer.getByRole("group", { name: "System" })).toHaveAttribute("data-dimmed", "");
	await expect(mixer.getByRole("group", { name: "Mic" })).not.toHaveAttribute("data-dimmed");
});

test("level meters move with the demo signal", async ({ page }) => {
	await page.goto("/docs/components/level-meter");
	const meter = page.getByRole("meter", { name: "Program level" }).first();
	const first = await meter.getAttribute("aria-valuenow");
	await expect.poll(() => meter.getAttribute("aria-valuenow"), { timeout: 10_000 }).not.toBe(first);
	const level = await page
		.locator('[data-slot="level-meter-channel"]')
		.first()
		.evaluate((element) =>
			Number((element as HTMLElement).style.getPropertyValue("--meter-level"))
		);
	expect(level).toBeGreaterThan(0);
});

test("faders respond to the keyboard", async ({ page }) => {
	await page.goto("/docs/components/fader");
	await waitForHydration(page);
	const slider = page.getByRole("slider").first();
	const controls = await page.getByRole("slider").all();
	await Promise.all(controls.map((control) => expect(control).toHaveAccessibleName(/.+/u)));
	await slider.focus();
	const before = await slider.getAttribute("aria-valuetext");
	await page.keyboard.press("Shift+ArrowUp");
	await expect(slider).not.toHaveAttribute("aria-valuetext", before ?? "");
});

test("the mixer block renders its strips", async ({ page }) => {
	await page.goto("/docs/blocks/system-audio-mixer");
	await waitForHydration(page);
	const strips = ["Microphone", "System audio", "Music", "Sounds", "Master"];
	await Promise.all(
		strips.map((name) =>
			expect(page.getByRole("group", { exact: true, name }).first()).toBeVisible()
		)
	);
	await page.getByRole("tab", { name: "Console" }).first().click();
	await expect(page.locator('[data-slot="mixer"]').first()).toHaveAttribute(
		"data-orientation",
		"vertical"
	);
});

test("sound pads play synthesised demo audio", async ({ page }) => {
	await page.goto("/docs/components/sound-pad");
	await waitForHydration(page);
	const pad = page.getByRole("button", { name: /Airhorn/u }).first();
	await expect(pad).not.toHaveAttribute("data-loading", "", {
		timeout: 15_000,
	});
	await pad.click();
	await expect(pad).toHaveAttribute("data-playing", "");
});

test("soundboard removal is reversible without losing pad order", async ({ page }) => {
	await page.goto("/docs/blocks/soundboard");
	await waitForHydration(page);
	const board = page.locator('[data-slot="soundboard"]');
	const pads = board.locator("[data-sound-pad]");
	await expect(pads.first()).toBeVisible();
	const before = await pads.allTextContents();
	await pads.first().click({ button: "right" });
	await page.getByRole("menuitem", { exact: true, name: "Remove" }).click();
	await expect(pads).toHaveCount(before.length - 1);
	await expect(board.getByRole("status")).toContainText("You can undo");
	await board.getByRole("button", { name: "Undo removal" }).click();
	await expect(pads).toHaveCount(before.length);
	expect(await pads.allTextContents()).toEqual(before);
	await expect(board.getByRole("status")).toContainText("Restored");
});

/** A short, silent 16-bit mono PCM WAV that the browser can decode. */
const silentWav = (sampleRate = 8000, samples = 800) => {
	const dataBytes = samples * 2;
	const wav = Buffer.alloc(44 + dataBytes);
	wav.write("RIFF", 0);
	wav.writeUInt32LE(36 + dataBytes, 4);
	wav.write("WAVEfmt ", 8);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(1, 22);
	wav.writeUInt32LE(sampleRate, 24);
	wav.writeUInt32LE(sampleRate * 2, 28);
	wav.writeUInt16LE(2, 32);
	wav.writeUInt16LE(16, 34);
	wav.write("data", 36);
	wav.writeUInt32LE(dataBytes, 40);
	return wav;
};

test("soundboard frees a dropped file once its removal can't be undone", async ({ page }) => {
	await page.goto("/docs/blocks/soundboard");
	await waitForHydration(page);
	const board = page.locator('[data-slot="soundboard"]');
	const pads = board.locator("[data-sound-pad]");
	await expect(pads.first()).toBeVisible();
	await page.evaluate(() => {
		const revoked: string[] = [];
		Object.assign(window, { revoked });
		const revoke = URL.revokeObjectURL.bind(URL);
		URL.revokeObjectURL = (url) => {
			revoked.push(url);
			revoke(url);
		};
	});
	const readRevoked = () =>
		page.evaluate(() => (window as unknown as { revoked: string[] }).revoked);
	const remove = async (label: string) => {
		await pads.filter({ hasText: label }).click({ button: "right" });
		await page.getByRole("menuitem", { exact: true, name: "Remove" }).click();
		await expect(pads.filter({ hasText: label })).toHaveCount(0);
	};

	await board.getByLabel("Add audio files").setInputFiles(
		["kick", "snare"].map((name) => ({
			buffer: silentWav(),
			mimeType: "audio/wav",
			name: `${name}.wav`,
		}))
	);
	await expect(board.getByRole("status")).toContainText("Added 2 sounds");

	await remove("kick");
	expect(await readRevoked()).toEqual([]);
	await remove("snare");
	const revoked = await readRevoked();
	expect(revoked).toHaveLength(1);
	expect(revoked[0]).toMatch(/^blob:/u);

	await board.getByRole("button", { name: "Undo removal" }).click();
	await expect(pads.filter({ hasText: "snare" })).toHaveCount(1);
	expect(await readRevoked()).toHaveLength(1);
});

test("soundboard rejects non-audio files with inline feedback", async ({ page }) => {
	await page.goto("/docs/blocks/soundboard");
	await waitForHydration(page);
	const board = page.locator('[data-slot="soundboard"]');
	const pads = board.locator("[data-sound-pad]");
	await expect(pads.first()).toBeVisible();
	const count = await pads.count();
	await board.getByLabel("Add audio files").setInputFiles({
		buffer: Buffer.from("not audio"),
		mimeType: "text/plain",
		name: "notes.txt",
	});
	await expect(board.getByRole("status")).toContainText("No new sounds added");
	await expect(pads).toHaveCount(count);
});

test("the theme picker switches themes", async ({ page }) => {
	await page.goto("/docs");
	await waitForHydration(page);
	await page.getByRole("button", { name: "Theme" }).first().click();
	await page.getByRole("option", { name: "Ocean" }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "ocean");
});

test("the home theme swatches retheme the site in place of the navbar picker", async ({ page }) => {
	await page.goto("/");
	await waitForHydration(page);
	await expect(page.getByRole("button", { name: "Theme" })).toHaveCount(0);
	const rose = page.getByRole("button", { name: "Rose" });
	await rose.click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "rose");
	await expect(rose).toHaveAttribute("aria-pressed", "true");
	await page.goto("/docs");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "rose");
	await expect(page.getByRole("button", { name: "Theme" }).first()).toContainText("Rose");
});

/** Shared CI runners draw without a GPU, so they get a floor that still catches a re-render storm. */
const MIN_FPS = process.env.CI ? 15 : 50;

/** The attributes a meter writes as it paints: fill, reading, zone and clip light. */
const PAINTED_ATTRIBUTES = [
	"style",
	"aria-valuenow",
	"aria-valuetext",
	"data-zone",
	"data-clipping",
];

interface DomWrites {
	/** Painted attributes on a level meter, its parts or its strip's clip light. */
	meterPaints: number;
	/** Painted attributes elsewhere, and the text a dB readout writes in place. */
	otherPaints: number;
	/** Observer deliveries holding any other write: one per Svelte update that reached the DOM. */
	rerenders: number;
}

interface PerfWindow {
	audiocnFrames: { count: number; start: number };
	audiocnWrites: DomWrites;
}

/** Frame rate and DOM writes inside `root` over two seconds of the page running. */
const measureFrames = async (page: Page, root: Locator) => {
	await root.evaluate((element, painted) => {
		const perf = window as unknown as PerfWindow;
		const writes: DomWrites = { meterPaints: 0, otherPaints: 0, rerenders: 0 };
		perf.audiocnWrites = writes;
		new MutationObserver((records) => {
			let rerendered = false;
			for (const record of records) {
				const target =
					record.target instanceof Element ? record.target : record.target.parentElement;
				if (record.type === "attributes" && painted.includes(record.attributeName ?? "")) {
					if (
						record.attributeName === "data-clipping" ||
						target?.closest('[data-slot="level-meter"]')
					) {
						writes.meterPaints += 1;
					} else {
						writes.otherPaints += 1;
					}
				} else if (record.type === "characterData" && target?.closest('[data-slot="db-readout"]')) {
					writes.otherPaints += 1;
				} else {
					rerendered = true;
				}
			}
			if (rerendered) {
				writes.rerenders += 1;
			}
		}).observe(element, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
		const frames = { count: 0, start: performance.now() };
		perf.audiocnFrames = frames;
		const tick = () => {
			frames.count += 1;
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}, PAINTED_ATTRIBUTES);
	await page.waitForTimeout(2000);
	return page.evaluate(() => {
		const perf = window as unknown as PerfWindow;
		const frames = perf.audiocnFrames;
		return {
			...perf.audiocnWrites,
			fps: (frames.count * 1000) / (performance.now() - frames.start),
			meters: document.querySelectorAll('[data-slot="level-meter"]').length,
		};
	});
};

test("a 16-strip console meters at full frame rate without re-rendering", async ({ page }) => {
	await page.goto("/docs/components/mixer");
	const meter = page.getByRole("meter", { name: "In 16 level" });
	await meter.scrollIntoViewIfNeeded();
	await expect(meter).toBeVisible();
	await expect
		.poll(async () => Number(await meter.getAttribute("aria-valuenow")), {
			timeout: 10_000,
		})
		.toBeGreaterThan(-60);
	// Let loading, scrolling and the table of contents settle.
	await page.waitForTimeout(1500);

	const result = await measureFrames(
		page,
		page.locator('[data-slot="mixer"]').filter({ has: meter })
	);
	expect(result.meters).toBeGreaterThanOrEqual(16);
	// Paints while measuring: proves the observer sees the meters' writes.
	expect(result.meterPaints).toBeGreaterThan(0);
	expect(result.otherPaints).toBe(0);
	expect(result.rerenders).toBe(0);
	expect(result.fps).toBeGreaterThan(MIN_FPS);
});

test.describe("the whole home showcase on screen", () => {
	// Tall enough that every tile is visible, so none of them pauses.
	test.use({ viewport: { height: 2200, width: 1440 } });

	test("keeps full frame rate with every tile live", async ({ page }) => {
		await page.goto("/");
		await mountShowcase(page);
		// Let the demo audio render and the tiles settle.
		await page.waitForTimeout(1500);

		const result = await measureFrames(page, page.getByRole("region", { name: "Live components" }));
		expect(result.meters).toBeGreaterThanOrEqual(10);
		expect(result.meterPaints).toBeGreaterThan(0);
		// Meters paint without re-rendering; a latching clip light may update once.
		expect(result.rerenders).toBeLessThanOrEqual(2);
		expect(result.fps).toBeGreaterThan(MIN_FPS);
	});
});

test("the registry serves built items", async ({ request }) => {
	const response = await request.get("/r/level-meter.json");
	expect(response.ok()).toBe(true);
	const item = (await response.json()) as {
		name: string;
		files: { content: string }[];
		registryDependencies: string[];
	};
	expect(item.name).toBe("level-meter");
	expect(item.files[0]?.content).toContain("Root as LevelMeter");
	expect(item.registryDependencies).toContain("./core.json");
});

test("llms.txt lists the docs", async ({ request }) => {
	const response = await request.get("/llms.txt");
	expect(await response.text()).toContain("Level Meter");
});
