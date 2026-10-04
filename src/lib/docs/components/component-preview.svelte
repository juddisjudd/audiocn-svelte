<script lang="ts">
	import type { Component } from "svelte";
	import Tab from "#lib/components/Tab.svelte";
	import Tabs from "#lib/components/Tabs.svelte";
	import { Skeleton } from "#lib/components/ui/skeleton/index.js";
	import { cn } from "#lib/utils.js";
	import { useDocsPageContext } from "../context.js";
	import { loadExample, loadExampleSource } from "../examples.js";
	import CodeBlock from "./code-block.svelte";

	interface Props {
		/** An example in `src/lib/docs/examples/<name>.svelte`. */
		name: string;
		align?: "center" | "start" | "end";
		class?: string;
	}

	let { name, align = "center", class: className }: Props = $props();

	const page = useDocsPageContext();

	// Outside a docs page (or for a name the page did not declare), load in the browser.
	let loaded = $state<{ name: string; example?: Component; source?: string; done: boolean }>();

	const context = $derived(page());
	const declared = $derived(!!context && name in context.previews);
	const current = $derived(loaded?.name === name ? loaded : undefined);
	const Example = $derived(declared ? context?.previews[name] : current?.example);
	const missing = $derived(declared ? !Example : !!current?.done && !current.example);
	const code = $derived(context?.previewCode[name]);

	$effect(() => {
		if (declared) {
			return;
		}
		const requested = name;
		let cancelled = false;
		Promise.all([loadExample(requested), loadExampleSource(requested)]).then(
			([example, source]) => {
				if (!cancelled) {
					loaded = { name: requested, example, source, done: true };
				}
			}
		);
		return () => {
			cancelled = true;
		};
	});
</script>

<!-- Search indexes the prose, not the demo's labels. -->
<div class="not-prose" data-slot="component-preview-tabs" data-pagefind-ignore>
	<Tabs items={["Preview", "Code"]}>
		<Tab>
			<div
				data-slot="component-preview"
				class={cn(
					"flex min-h-72 w-full justify-center rounded-[0.65rem] border border-(--line) bg-background p-4 font-sans text-foreground sm:p-10",
					align === "center" && "items-center",
					align === "start" && "items-start",
					align === "end" && "items-end",
					className
				)}
			>
				{#if Example}
					<svelte:boundary>
						<Example />
						{#snippet failed()}
							<p class="text-sm text-destructive">
								Example <code>{name}</code> failed to render.
							</p>
						{/snippet}
					</svelte:boundary>
				{:else if missing}
					<p class="text-sm text-muted-foreground">Example <code>{name}</code> not found.</p>
				{:else}
					<Skeleton class="h-24 w-full max-w-sm" />
				{/if}
			</div>
		</Tab>
		<Tab>
			{#if code}
				<CodeBlock html={code} maxHeight="32rem" />
			{:else if current?.source}
				<CodeBlock code={current.source} maxHeight="32rem" />
			{:else}
				<p class="missing">No source for <code>{name}</code>.</p>
			{/if}
		</Tab>
	</Tabs>
</div>

<style>
	.missing {
		color: var(--text-dim);
		font-size: 0.875rem;
	}
</style>
