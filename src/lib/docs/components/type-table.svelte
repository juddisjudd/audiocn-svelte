<script lang="ts" module>
	export interface TypeNode {
		type: string;
		default?: string;
		description?: string;
		required?: boolean;
	}
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";

	interface Props {
		/** Props by name, in the same shape as Fumadocs' `TypeTable`. */
		type: Record<string, TypeNode>;
		class?: string;
	}

	let { type, class: className }: Props = $props();
</script>

<div class={cn("not-prose my-6 overflow-x-auto rounded-xl border", className)}>
	<table class="w-full text-left text-sm">
		<thead class="bg-muted/50 text-muted-foreground">
			<tr>
				<th scope="col" class="px-4 py-2.5 font-medium">Prop</th>
				<th scope="col" class="px-4 py-2.5 font-medium">Type</th>
				<th scope="col" class="px-4 py-2.5 font-medium">Default</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(type) as [name, node] (name)}
				<tr class="border-t align-top">
					<td class="px-4 py-3">
						<code class="font-mono text-[0.8125rem] font-medium whitespace-nowrap text-primary"
							>{name}</code
						>{#if node.required}<span class="text-destructive" title="Required">*</span>{/if}
						{#if node.description}
							<p class="mt-1 min-w-48 text-[0.8125rem] leading-relaxed text-muted-foreground">
								{node.description}
							</p>
						{/if}
					</td>
					<td class="px-4 py-3">
						<code class="font-mono text-[0.8125rem] break-words">{node.type}</code>
					</td>
					<td class="px-4 py-3">
						{#if node.default}
							<code class="font-mono text-[0.8125rem] whitespace-nowrap">{node.default}</code>
						{:else}
							<span class="text-muted-foreground">—</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
