<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "#lib/utils.js";

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div data-slot="step" class={cn("docs-step", className)}>
	{@render children?.()}
</div>
