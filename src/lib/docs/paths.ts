/**
 * The path the site is served under, such as `/audiocn-svelte` on GitHub
 * Pages. Empty when it is served from the domain root. Set by `VITE_BASE_PATH`
 * at build time, the same variable that sets SvelteKit's `paths.base`.
 */
export const BASE_PATH: string = import.meta.env.VITE_BASE_PATH ?? "";

/** A site path such as `/docs/components`, as a link that includes the base path. */
export const withBase = (path: string) => `${BASE_PATH}${path}`;

/** A page's pathname without the base path, to compare with site paths. */
export const withoutBase = (pathname: string) =>
	BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || "/" : pathname;
