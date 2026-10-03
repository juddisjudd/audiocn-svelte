<script lang="ts">
	import type { Snippet } from "svelte";
	import ArrowUpRightIcon from "phosphor-svelte/lib/ArrowUpRightIcon";
	import { cn } from "#lib/utils.js";

	interface Props {
		/** The name on the card, like the tape label on a console channel. */
		label: string;
		/** The docs page the label links to. */
		href: string;
		class?: string;
		children?: Snippet;
	}

	let { label, href, class: className, children }: Props = $props();
</script>

<!-- Only the label is a link, so every control in the tile stays usable. -->
<article
	aria-label={label}
	data-slot="showcase-card"
	class={cn(
		"flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground",
		className
	)}
>
	<a
		{href}
		class="group/label -m-1 flex w-fit items-center gap-1 rounded-sm p-1 font-mono text-xs tracking-wider text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
	>
		{label}
		<span class="sr-only"> docs</span>
		<ArrowUpRightIcon
			aria-hidden="true"
			class="size-3 transition-transform group-hover/label:translate-x-0.5 group-hover/label:-translate-y-0.5"
		/>
	</a>
	<div class="flex min-w-0 flex-1 flex-col items-center justify-center">
		{@render children?.()}
	</div>
</article>
