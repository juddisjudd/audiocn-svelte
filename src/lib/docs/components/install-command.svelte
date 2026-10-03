<script lang="ts">
	import { Tabs } from "bits-ui";
	import { cn } from "#lib/utils.js";
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
		class?: string;
	}

	let { command, name, class: className }: Props = $props();

	const commands = $derived(
		convertNpmCommand(expandRegistryItems(command ?? (name ? installCommand(name) : "")))
	);
</script>

<div
	data-slot="install-command"
	class={cn("not-prose relative my-4 overflow-hidden rounded-xl border bg-code", className)}
>
	<Tabs.Root
		value={packageManager.current}
		onValueChange={(value) => (packageManager.current = value as PackageManager)}
	>
		<div class="flex h-10 items-center gap-3 overflow-x-auto border-b pr-12 pl-4">
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				class="size-4 shrink-0 text-muted-foreground"
				fill="currentColor"
			>
				<path d={PACKAGE_MANAGER_ICONS[packageManager.current]} />
			</svg>
			<Tabs.List class="flex h-full items-center gap-1">
				{#each PACKAGE_MANAGERS as manager (manager)}
					<Tabs.Trigger
						value={manager}
						class="relative flex h-full items-center px-2 font-mono text-sm text-muted-foreground outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:text-foreground data-[state=active]:after:bg-foreground"
					>
						{manager}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</div>
		{#each PACKAGE_MANAGERS as manager (manager)}
			<Tabs.Content value={manager} class="outline-none">
				<pre class="overflow-x-auto overscroll-x-contain p-4 leading-6"><code
						data-language="bash"
						class="font-mono text-sm text-muted-foreground"
						><span class="select-none">$ </span>{commands[manager]}</code
					></pre>
			</Tabs.Content>
		{/each}
	</Tabs.Root>
	<CopyButton
		text={() => commands[packageManager.current]}
		label="Copy command"
		class="absolute top-1.5 right-2 z-10"
	/>
</div>
