<script lang="ts">
	import TextAlignLeftIcon from "phosphor-svelte/lib/TextAlignLeftIcon";
	import type { TocEntry } from "../types.js";

	let { toc }: { toc: TocEntry[] } = $props();

	let active = $state<string>();

	$effect(() => {
		const headings = toc
			.map((entry) => document.getElementById(entry.id))
			.filter((element): element is HTMLElement => !!element);
		if (headings.length === 0) {
			return;
		}
		const visible: Record<string, boolean> = {};
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					visible[entry.target.id] = entry.isIntersecting;
				}
				const first = toc.find((item) => visible[item.id]);
				if (first) {
					active = first.id;
				}
			},
			{ rootMargin: "-80px 0px -60% 0px" }
		);
		for (const heading of headings) {
			observer.observe(heading);
		}
		return () => observer.disconnect();
	});
</script>

{#if toc.length > 0}
	<div class="flex flex-col gap-3 text-sm">
		<p class="flex items-center gap-1.5 font-medium text-muted-foreground">
			<TextAlignLeftIcon aria-hidden="true" class="size-4" />
			On this page
		</p>
		<ul class="flex flex-col border-s border-border">
			{#each toc as entry (entry.id)}
				<li>
					<a
						href="#{entry.id}"
						data-active={active === entry.id ? "" : undefined}
						class="-ms-px block border-s border-transparent py-1 text-muted-foreground transition-colors hover:text-foreground data-active:border-primary data-active:text-primary {entry.depth >
						2
							? 'ps-6'
							: 'ps-3'}"
					>
						{entry.text}
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
