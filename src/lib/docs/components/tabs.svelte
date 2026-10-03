<script lang="ts" module>
	import { getContext } from "svelte";

	const KEY = Symbol("docs-tabs");

	interface TabsContext {
		/** The value for the next `Tab` that has none, in order. */
		next: () => string | undefined;
	}

	export const useDocsTabs = () => getContext<TabsContext | undefined>(KEY);
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { setContext } from "svelte";
	import { Tabs } from "bits-ui";
	import { cn } from "#lib/utils.js";

	interface Props {
		/** Tab labels, in order. Each `Tab` matches one by `value`, or by position. */
		items: string[];
		defaultIndex?: number;
		class?: string;
		children?: Snippet;
	}

	let { items, defaultIndex = 0, class: className, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	let value = $state(items[defaultIndex] ?? items[0] ?? "");
	let registered = 0;

	setContext<TabsContext>(KEY, {
		next: () => items[registered++],
	});
</script>

<Tabs.Root
	bind:value
	data-slot="docs-tabs"
	class={cn("my-6 overflow-hidden rounded-xl border bg-card", className)}
>
	<Tabs.List class="flex gap-4 overflow-x-auto border-b px-4 text-muted-foreground">
		{#each items as item (item)}
			<Tabs.Trigger
				value={item}
				class="-mb-px border-b-2 border-transparent py-2.5 text-sm font-medium whitespace-nowrap outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:border-primary data-[state=active]:text-primary"
			>
				{item}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{@render children?.()}
</Tabs.Root>
