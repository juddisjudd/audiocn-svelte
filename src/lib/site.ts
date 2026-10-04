export const SITE_NAME = 'audiocn-svelte';
export const SITE_DESCRIPTION =
	'Copy-and-paste audio components for Svelte and shadcn-svelte. Build mixers, players, meters, knobs and waveforms with accessible UI you own.';

/**
 * Your production domain, e.g. 'https://docs.example.com' — no trailing
 * slash. Used to build absolute URLs in llms.txt/llms-full.txt. Left empty
 * by default (falls back to relative paths, which still work) since a
 * fresh scaffold doesn't know its own domain yet.
 */
export const SITE_URL = 'https://juddisjudd.github.io/audiocn-svelte';

/**
 * Link to this project's repository. When set, the header shows a GitHub
 * button pointing here, and doc pages get an "Edit on GitHub" link. Leave
 * empty to hide both.
 */
export const REPO_URL = 'https://github.com/juddisjudd/audiocn-svelte';

/** Branch "Edit on GitHub" links point at. */
export const REPO_BRANCH = 'main';

/** GitHub blob URL for a content file's `content/…` path, or undefined without a REPO_URL. */
export function getEditUrl(sourcePath: string): string | undefined {
	return REPO_URL ? `${REPO_URL}/blob/${REPO_BRANCH}/${sourcePath}` : undefined;
}
