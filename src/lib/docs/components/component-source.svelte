<script lang="ts">
	import { useDocsPageContext } from "../context.js";
	import CodeBlock from "./code-block.svelte";

	interface Props {
		/** A file path from the project root, such as `src/lib/components/ui/fader/fader.svelte`. */
		path: string;
		title?: string;
	}

	let { path, title }: Props = $props();

	const page = useDocsPageContext();

	const code = $derived(page()?.sourceCode[path]);
</script>

{#if code}
	<CodeBlock html={code} title={title ?? path} maxHeight="28rem" />
{:else}
	<p>Source <code>{path}</code> not found.</p>
{/if}
