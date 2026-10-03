<script lang="ts">
	import CaretLeftIcon from "phosphor-svelte/lib/CaretLeftIcon";
	import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
	import { withBase } from "../paths.js";

	interface PagerLink {
		title: string;
		href: string;
	}

	let { previous, next }: { previous?: PagerLink; next?: PagerLink } = $props();

	const CARD =
		"hover:bg-accent/60 focus-visible:ring-ring/50 flex flex-col gap-1 rounded-xl border p-4 text-sm transition-colors outline-none focus-visible:ring-3";
</script>

{#if previous || next}
	<nav aria-label="Previous and next page" class="mt-16 grid grid-cols-2 gap-4">
		{#if previous}
			<a href={withBase(previous.href)} class={CARD}>
				<span class="inline-flex items-center gap-1 text-muted-foreground">
					<CaretLeftIcon aria-hidden="true" class="size-3.5" />
					Previous
				</span>
				<span class="font-medium">{previous.title}</span>
			</a>
		{:else}
			<span></span>
		{/if}
		{#if next}
			<a href={withBase(next.href)} class="{CARD} items-end text-end">
				<span class="inline-flex items-center gap-1 text-muted-foreground">
					Next
					<CaretRightIcon aria-hidden="true" class="size-3.5" />
				</span>
				<span class="font-medium">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
