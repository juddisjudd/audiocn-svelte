<script lang="ts">
	import { enhanceCodeBlocks } from "#lib/themes/docs/code-blocks.js";

	interface Props {
		/** Highlighted `<pre>` HTML from `highlightCode`. */
		html?: string;
		/** Plain source, shown unhighlighted when there is no `html`. */
		code?: string;
		title?: string;
		/** Scroll the code past this height, such as `28rem`. */
		maxHeight?: string;
	}

	let { html, code, title, maxHeight }: Props = $props();

	let body = $state<HTMLElement>();

	// The svocs copy button, added when this block mounts. A preview's Code tab
	// mounts after the layout has enhanced the page's static code blocks.
	$effect(() => {
		void html;
		void code;
		enhanceCodeBlocks(body ?? null);
	});
</script>

<!-- The same .code-frame markup the svocs highlighter emits for fences, styled by the docs layout. -->
<div class="code-frame" data-slot="code-block" style:--code-max-height={maxHeight}>
	{#if title}
		<div class="code-frame-header"><span>{title}</span></div>
	{/if}
	<div class="code-frame-body" bind:this={body}>
		{#if html !== undefined}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Prism output from our own sources -->
			{@html html}
		{:else}
			<pre><code>{code}</code></pre>
		{/if}
	</div>
</div>

<style>
	.code-frame-body :global(pre) {
		max-height: var(--code-max-height, none);
	}
</style>
