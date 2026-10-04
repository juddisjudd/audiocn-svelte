<script lang="ts" module>
	export interface TypeNode {
		type: string;
		default?: string;
		description?: string;
		required?: boolean;
	}
</script>

<script lang="ts">
	interface Props {
		/** Props by name, in the same shape as Fumadocs' `TypeTable`. */
		type: Record<string, TypeNode>;
	}

	let { type }: Props = $props();
</script>

<div class="type-table not-prose">
	<table>
		<thead>
			<tr>
				<th scope="col">Prop</th>
				<th scope="col">Type</th>
				<th scope="col">Default</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(type) as [name, node] (name)}
				<tr>
					<td>
						<code class="name">{name}</code>{#if node.required}<span
								class="required"
								title="Required">*</span
							>{/if}
						{#if node.description}
							<p>{node.description}</p>
						{/if}
					</td>
					<td><code class="type">{node.type}</code></td>
					<td>
						{#if node.default}
							<code class="default">{node.default}</code>
						{:else}
							<span class="none">—</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.type-table {
		margin: 1.5rem 0;
		overflow-x: auto;
		border: 1px solid var(--line);
		border-radius: 0.65rem;
		background: color-mix(in srgb, var(--bg-elev) 60%, transparent);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		text-align: left;
	}

	th {
		padding: 0.6rem 1rem;
		background: color-mix(in srgb, var(--bg-soft-2) 60%, transparent);
		color: var(--text-dim);
		font-weight: 600;
		border-bottom: 1px solid var(--line);
	}

	td {
		padding: 0.75rem 1rem;
		vertical-align: top;
		color: var(--text-soft);
	}

	tr + tr td {
		border-top: 1px solid var(--line);
	}

	code {
		font-family: "Cascadia Code", "JetBrains Mono", Consolas, monospace;
		font-size: 0.8125rem;
	}

	.name {
		color: var(--brand-strong);
		font-weight: 600;
		white-space: nowrap;
	}

	.type {
		color: var(--text);
		overflow-wrap: anywhere;
	}

	.default {
		white-space: nowrap;
	}

	.required {
		color: var(--danger);
	}

	p {
		margin: 0.25rem 0 0;
		min-width: 12rem;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--text-dim);
	}

	.none {
		color: var(--text-dim);
	}
</style>
