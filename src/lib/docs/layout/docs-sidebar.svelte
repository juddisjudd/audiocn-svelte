<script lang="ts">
	import { cn } from "#lib/utils.js";
	import type { NavItem } from "../types.js";

	interface Props {
		nav: NavItem[];
		pathname: string;
		class?: string;
	}

	let { nav, pathname, class: className }: Props = $props();
</script>

<nav aria-label="Docs" class={cn("flex flex-col text-sm", className)}>
	{#each nav as item, index (index)}
		{#if item.type === "separator"}
			<p class="mt-6 mb-1.5 px-2 text-xs font-semibold tracking-wide text-foreground first:mt-0">
				{item.title}
			</p>
		{:else}
			<a
				href={item.href}
				aria-current={item.href === pathname ? "page" : undefined}
				class="rounded-md px-2 py-1.5 text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-[current=page]:bg-primary/10 aria-[current=page]:font-medium aria-[current=page]:text-primary"
			>
				{item.title}
			</a>
		{/if}
	{/each}
</nav>
