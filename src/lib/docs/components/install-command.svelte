<script lang="ts">
	import { Tabs } from "bits-ui";
	import {
		convertNpmCommand,
		packageManager,
		PACKAGE_MANAGERS,
		type PackageManager,
	} from "../package-manager.svelte.js";
	import { PACKAGE_MANAGER_ICONS } from "../package-manager-icons.js";
	import { expandRegistryItems, installCommand } from "../site.js";
	import CopyButton from "./copy-button.svelte";

	interface Props {
		/** An npm or npx command, shown translated for each package manager. */
		command?: string;
		/** A registry item name; shorthand for its shadcn-svelte install command. */
		name?: string;
	}

	let { command, name }: Props = $props();

	const commands = $derived(
		convertNpmCommand(expandRegistryItems(command ?? (name ? installCommand(name) : "")))
	);
</script>

<!-- Uses the svocs tokens inside the docs and falls back to the shadcn ones on the home page. -->
<div data-slot="install-command" class="install not-prose">
	<Tabs.Root
		value={packageManager.current}
		onValueChange={(value) => (packageManager.current = value as PackageManager)}
	>
		<div class="header">
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
				<path d={PACKAGE_MANAGER_ICONS[packageManager.current]} />
			</svg>
			<Tabs.List class="list">
				{#each PACKAGE_MANAGERS as manager (manager)}
					<Tabs.Trigger value={manager} class="trigger">{manager}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</div>
		{#each PACKAGE_MANAGERS as manager (manager)}
			<Tabs.Content value={manager} class="content">
				<pre><code><span class="prompt">$ </span>{commands[manager]}</code></pre>
			</Tabs.Content>
		{/each}
	</Tabs.Root>
	<CopyButton text={() => commands[packageManager.current]} label="Copy command" />
</div>

<style>
	.install {
		--install-line: var(--line, var(--border));
		--install-dim: var(--text-dim, var(--muted-foreground));
		--install-text: var(--text, var(--foreground));
		position: relative;
		margin: 1rem 0;
		overflow: hidden;
		border: 1px solid var(--install-line);
		border-radius: 0.65rem;
		background: var(--bg-soft, var(--code));
		font-family: "Cascadia Code", "JetBrains Mono", Consolas, ui-monospace, monospace;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		height: 2.5rem;
		padding: 0 3rem 0 1rem;
		overflow-x: auto;
		border-bottom: 1px solid var(--install-line);
		background: color-mix(in srgb, var(--bg-soft-2, var(--muted)) 60%, transparent);
		color: var(--install-dim);
	}

	svg {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.install :global(.list) {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		height: 100%;
	}

	.install :global(.trigger) {
		position: relative;
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0 0.5rem;
		font-size: 0.8125rem;
		color: var(--install-dim);
		outline: none;
		transition: color 120ms ease;
	}

	.install :global(.trigger::after) {
		content: "";
		position: absolute;
		inset: auto 0 0;
		height: 2px;
		background: transparent;
	}

	.install :global(.trigger:hover),
	.install :global(.trigger[data-state="active"]) {
		color: var(--install-text);
	}

	.install :global(.trigger[data-state="active"]::after) {
		background: var(--brand, var(--foreground));
	}

	.install :global(.trigger:focus-visible) {
		outline: 2px solid var(--brand, var(--ring));
		outline-offset: -2px;
	}

	.install :global(.content) {
		outline: none;
	}

	pre {
		margin: 0;
		padding: 0.9rem 1rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-soft, var(--muted-foreground));
	}

	code {
		font-family: inherit;
	}

	.prompt {
		user-select: none;
		color: var(--install-dim);
	}

	.install :global([data-slot="copy-button"]) {
		position: absolute;
		top: 0.3rem;
		right: 0.5rem;
	}
</style>
