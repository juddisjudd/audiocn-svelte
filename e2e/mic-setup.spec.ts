import { expect, test } from "@playwright/test";

import { gotoHydrated } from "./hydration";

test("blocked microphone access has visible guidance", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
			value: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
		});
	});
	await gotoHydrated(page, "/docs/blocks/mic-setup");
	await page.getByRole("button", { name: "Turn on microphone" }).click();
	await expect(page.getByRole("alert").filter({ hasText: "Microphone blocked" })).toBeVisible();
});
