<script lang="ts">
	import { cn } from "#lib/utils.js";
	import ShowcaseCard from "./showcase-card.svelte";
	import ShowcaseTile from "./showcase-tile.svelte";
	import { GRID, TILES, type TileName } from "./tiles.js";
</script>

{#snippet column(names: TileName[], className: string)}
	<div class={cn("flex min-w-0 flex-col gap-4", className)}>
		{#each names as name (name)}
			<ShowcaseCard label={TILES[name].label} href={TILES[name].href}>
				<ShowcaseTile {name} />
			</ShowcaseCard>
		{/each}
	</div>
{/snippet}

<!-- Narrow, wide, narrow on desktop. The wide stack comes first in the markup. -->
<section aria-label="Live components" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
	{@render column(GRID.wide, "md:col-span-2 lg:order-2")}
	{@render column(GRID.left, "lg:order-1")}
	{@render column(GRID.right, "lg:order-3")}
</section>
