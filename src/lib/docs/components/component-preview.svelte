<script lang="ts">
	import type { Component } from "svelte";
	import * as Tabs from "#lib/components/ui/tabs/index.js";
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

<div class="not-prose my-6" data-slot="component-preview-tabs">
	<Tabs.Root value="preview">
		<Tabs.List variant="line">
			<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
			<Tabs.Trigger value="code">Code</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="preview">
			<div
				data-slot="component-preview"
				class={cn(
					"flex min-h-72 w-full justify-center rounded-xl border bg-background p-4 sm:p-10",
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
		</Tabs.Content>
		<Tabs.Content value="code" class="[&_figure]:my-0 [&_pre]:max-h-[32rem]">
			{#if code}
				<CodeBlock html={code} lang="svelte" />
			{:else if current?.source}
				<CodeBlock lang="svelte">
					<pre><code>{current.source}</code></pre>
				</CodeBlock>
			{:else}
				<p class="text-sm text-muted-foreground">No source for <code>{name}</code>.</p>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>
