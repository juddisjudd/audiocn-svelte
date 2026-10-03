<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "#lib/utils.js";
	import CopyButton from "./copy-button.svelte";

	interface Props {
		title?: string;
		lang?: string;
		/** Highlighted HTML. The markdown pipeline passes it as children instead. */
		html?: string;
		class?: string;
		children?: Snippet;
	}

	let { title, lang, html, class: className, children }: Props = $props();

	let body = $state<HTMLElement | null>(null);

	const text = () => body?.querySelector("pre")?.textContent ?? "";
</script>

<figure
	data-slot="code-block"
	data-lang={lang}
	class={cn(
		"not-prose group/code relative my-4 overflow-hidden rounded-xl border bg-code text-sm text-code-foreground",
		className
	)}
>
	{#if title}
		<figcaption
			class="flex h-10 items-center border-b px-4 pr-12 font-mono text-xs text-muted-foreground"
		>
			{title}
		</figcaption>
	{/if}
	<div bind:this={body} class="code-block-body">
		{#if html !== undefined}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- shiki output from our own sources -->
			{@html html}
		{:else}
			{@render children?.()}
		{/if}
	</div>
	<CopyButton
		{text}
		label="Copy code"
		class={cn("absolute right-2", title ? "top-1.5" : "top-2")}
	/>
</figure>
