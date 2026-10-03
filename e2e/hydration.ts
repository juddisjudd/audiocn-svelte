import type { Page } from "@playwright/test";

/** SvelteKit hydrates after the load event and switches to manual scroll restoration once it has. */
export const waitForHydration = async (page: Page) => {
	await page.waitForFunction(() => history.scrollRestoration === "manual");
};

export const gotoHydrated = async (page: Page, url: string) => {
	await page.goto(url);
	await waitForHydration(page);
};
