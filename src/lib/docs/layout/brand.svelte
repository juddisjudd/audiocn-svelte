<script lang="ts">
	import { cn } from "#lib/utils.js";
	import { withBase } from "../paths.js";
	import { siteConfig } from "../site.js";

	let { class: className }: { class?: string } = $props();
</script>

<a
	href={withBase("/")}
	class={cn(
		"inline-flex items-center gap-1.5 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
		className
	)}
>
	<svg
		viewBox="0 0 128 128"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		aria-hidden="true"
		class="size-6 shrink-0"
	>
		<path d="M38.4 102.9a43.5 43.5 0 1 1 51.2 0" stroke-width="8.6" />
		<path d="m63.3 70 20.5-23.8" stroke-width="8" />
	</svg>
	{siteConfig.name}
</a>
