/** Where the built registry (`static/r/`) is served. Change this one value to move it. */
export const REGISTRY_URL = "https://audiocn-svelte.dev/r";

/** Shorthand for a registry item in docs commands: `@audiocn-svelte/level-meter`. */
export const REGISTRY_SHORTHAND = "@audiocn-svelte";

export const siteConfig = {
	name: "audiocn-svelte",
	title: "audiocn-svelte — Audio components for Svelte and shadcn-svelte",
	description:
		"Copy-and-paste audio components for Svelte and shadcn-svelte. Build mixers, players, meters, knobs and waveforms with accessible UI you own.",
	url: "https://audiocn-svelte.dev",
	/** This port's repository. Leave empty to hide the GitHub link. */
	githubUrl: "https://github.com/juddisjudd/audiocn-svelte",
	upstream: {
		name: "audiocn",
		url: "https://github.com/audiocn/ui",
		site: "https://audiocn.dev",
		license: "MIT",
	},
} as const;

/** The public URL of one registry item. */
export const registryItemUrl = (name: string) => `${REGISTRY_URL}/${name}.json`;

/** The shadcn-svelte command that installs one registry item. */
export const installCommand = (name: string) =>
	`npx shadcn-svelte@latest add ${registryItemUrl(name)}`;

const SHORTHAND_PATTERN = new RegExp(`${REGISTRY_SHORTHAND}/([a-z0-9-]+)`, "g");

/** Expands every `@audiocn-svelte/<name>` in a command to the item's registry URL. */
export const expandRegistryItems = (command: string) =>
	command.replace(SHORTHAND_PATTERN, (_, name: string) => registryItemUrl(name));
