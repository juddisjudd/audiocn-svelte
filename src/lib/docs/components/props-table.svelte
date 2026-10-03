<script lang="ts" module>
	export type PropRow = [
		name: string,
		type: string,
		defaultValue: string | null,
		description: string | null,
	];
</script>

<script lang="ts">
	import TypeTable, { type TypeNode } from "./type-table.svelte";

	interface Props {
		rows: PropRow[];
	}

	let { rows }: Props = $props();

	const toTypeNode = (row: PropRow): TypeNode => ({
		type: row[1],
		default: row[2] ?? undefined,
		description: row[3] ?? undefined,
	});

	const type = $derived(Object.fromEntries(rows.map((row) => [row[0], toTypeNode(row)])));
</script>

{#if rows.length === 0}
	<p class="text-sm text-muted-foreground">No props.</p>
{:else}
	<TypeTable {type} />
{/if}
