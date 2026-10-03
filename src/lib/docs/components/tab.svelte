<script lang="ts">
	import type { Snippet } from "svelte";
	import { Tabs } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { useDocsTabs } from "./tabs.svelte";

	interface Props {
		/** The item this tab belongs to. Defaults to the next item in order. */
		value?: string;
		class?: string;
		children?: Snippet;
	}

	let { value, class: className, children }: Props = $props();

	const fallback = useDocsTabs()?.next() ?? "";
</script>

<Tabs.Content
	value={value ?? fallback}
	data-slot="docs-tab"
	class={cn("p-4 outline-none [&>:first-child]:mt-0 [&>:last-child]:mb-0", className)}
>
	{@render children?.()}
</Tabs.Content>
