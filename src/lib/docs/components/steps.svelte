<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "#lib/utils.js";

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div data-slot="steps" class={cn("docs-steps", className)}>
	{@render children?.()}
</div>
